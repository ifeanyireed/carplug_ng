package utils

import (
	"bytes"
	"crypto/rand"
	"encoding/json"
	"fmt"
	"log"
	"math/big"
	"net/http"
	"strings"
	"time"

	"github.com/ifeanyireed/carplug_ng/backend/config"
)

// GenerateNumericOTP generates a cryptographically random numeric string of given length
func GenerateNumericOTP(length int) (string, error) {
	const digits = "0123456789"
	b := make([]byte, length)
	for i := range b {
		num, err := rand.Int(rand.Reader, big.NewInt(int64(len(digits))))
		if err != nil {
			return "", err
		}
		b[i] = digits[num.Int64()]
	}
	return string(b), nil
}

type BrevoRecipient struct {
	Name  string `json:"name,omitempty"`
	Email string `json:"email"`
}

type BrevoSender struct {
	Name  string `json:"name"`
	Email string `json:"email"`
}

type BrevoSendEmailRequest struct {
	Sender      BrevoSender      `json:"sender"`
	To          []BrevoRecipient `json:"to"`
	Subject     string           `json:"subject"`
	HTMLContent string           `json:"htmlContent"`
}

// SendBrevoEmail dispatches an email via the Brevo REST API v3.
// If BREVO_API_KEY is not configured, it logs the email contents to stdout for seamless local development.
func SendBrevoEmail(toEmail, toName, subject, htmlContent string) error {
	cfg := config.AppConfig
	apiKey := cfg.BrevoAPIKey

	if apiKey == "" {
		log.Println("============================================================")
		log.Printf("[BREVO EMAIL DISPATCH (DEV MODE - No BREVO_API_KEY)]\n")
		log.Printf("To:      %s (%s)\n", toEmail, toName)
		log.Printf("Subject: %s\n", subject)
		log.Println("------------------------------------------------------------")
		log.Printf("%s\n", htmlContent)
		log.Println("============================================================")
		return nil
	}

	senderName := cfg.BrevoSenderName
	if senderName == "" {
		senderName = "CarPlug Nigeria"
	}
	senderEmail := cfg.BrevoSenderEmail
	if senderEmail == "" {
		senderEmail = "verify@carplug.ng"
	}

	payload := BrevoSendEmailRequest{
		Sender: BrevoSender{
			Name:  senderName,
			Email: senderEmail,
		},
		To: []BrevoRecipient{
			{Name: toName, Email: toEmail},
		},
		Subject:     subject,
		HTMLContent: htmlContent,
	}

	bodyBytes, err := json.Marshal(payload)
	if err != nil {
		return fmt.Errorf("failed to marshal Brevo request: %w", err)
	}

	req, err := http.NewRequest("POST", "https://api.brevo.com/v3/smtp/email", bytes.NewBuffer(bodyBytes))
	if err != nil {
		return fmt.Errorf("failed to build Brevo HTTP request: %w", err)
	}

	req.Header.Set("accept", "application/json")
	req.Header.Set("api-key", apiKey)
	req.Header.Set("content-type", "application/json")

	client := &http.Client{Timeout: 15 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		log.Printf("[Brevo ERROR] Network request to Brevo API failed: %v\n", err)
		return fmt.Errorf("brevo API request failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		var errResp map[string]interface{}
		_ = json.NewDecoder(resp.Body).Decode(&errResp)
		log.Printf("[Brevo ERROR] HTTP %d from Brevo API: %+v\n", resp.StatusCode, errResp)
		return fmt.Errorf("brevo API error HTTP %d: %v", resp.StatusCode, errResp)
	}

	log.Printf("[Brevo SUCCESS] Email successfully accepted by Brevo for %s (Subject: %s)\n", toEmail, subject)
	return nil
}

// SendVerificationOTP sends a 6-digit signup email verification code
func SendVerificationOTP(toEmail, toName, otpCode string) error {
	subject := fmt.Sprintf("Your CarPlug Verification Code: %s", otpCode)
	html := fmt.Sprintf(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your CarPlug Account</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f7f8fa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #111827;">
  <table width="100%%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f7f8fa; padding: 40px 15px;">
    <tr>
      <td align="center">
        <table width="100%%" border="0" cellspacing="0" cellpadding="0" style="max-width: 520px; background-color: #ffffff; border-radius: 24px; border: 1px solid #e5e7eb; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          <!-- Header -->
          <tr>
            <td style="padding: 32px 36px; background-color: #0f172a; text-align: center;">
              <span style="font-size: 20px; font-weight: 900; letter-spacing: 2px; color: #ffffff; text-transform: uppercase;">CARPLUG<span style="color: #3b82f6;">.NG</span></span>
              <p style="margin: 4px 0 0 0; font-size: 11px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px;">Trusted Automotive Verification</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding: 36px 36px 28px 36px;">
              <h1 style="margin: 0 0 12px 0; font-size: 22px; font-weight: 800; color: #0f172a;">Confirm Your Email</h1>
              <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.6; color: #4b5563;">
                Hello <strong>%s</strong>,<br>
                Thank you for joining CarPlug Nigeria. Use the 6-digit verification code below to confirm your email address and activate your account:
              </p>
              
              <!-- OTP Box -->
              <div style="margin: 0 0 24px 0; padding: 20px; background-color: #f1f5f9; border-radius: 16px; border: 1px solid #cbd5e1; text-align: center;">
                <span style="font-size: 34px; font-weight: 900; letter-spacing: 8px; color: #0f172a; font-family: monospace;">%s</span>
              </div>

              <p style="margin: 0 0 16px 0; font-size: 12px; color: #64748b; line-height: 1.5;">
                ⏰ <strong>This code expires in 10 minutes.</strong><br>
                If you did not request an account on CarPlug Nigeria, you can safely ignore this message.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 36px; background-color: #f8fafc; border-top: 1px solid #f1f5f9; text-align: center;">
              <p style="margin: 0; font-size: 11px; color: #94a3b8;">
                &copy; 2026 CarPlug Nigeria Ltd. 14 Admiralty Way, Lekki Phase 1, Lagos, Nigeria.<br>
                Empowering transparent, 150-point certified car transactions.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`, toName, otpCode)

	return SendBrevoEmail(toEmail, toName, subject, html)
}

// SendPasswordResetOTP sends a 6-digit password recovery code
func SendPasswordResetOTP(toEmail, toName, otpCode string) error {
	subject := fmt.Sprintf("Your CarPlug Password Reset Code: %s", otpCode)
	html := fmt.Sprintf(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your CarPlug Password</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f7f8fa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #111827;">
  <table width="100%%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f7f8fa; padding: 40px 15px;">
    <tr>
      <td align="center">
        <table width="100%%" border="0" cellspacing="0" cellpadding="0" style="max-width: 520px; background-color: #ffffff; border-radius: 24px; border: 1px solid #e5e7eb; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          <!-- Header -->
          <tr>
            <td style="padding: 32px 36px; background-color: #0f172a; text-align: center;">
              <span style="font-size: 20px; font-weight: 900; letter-spacing: 2px; color: #ffffff; text-transform: uppercase;">CARPLUG<span style="color: #ef4444;">.SECURITY</span></span>
              <p style="margin: 4px 0 0 0; font-size: 11px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px;">Account Recovery Service</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding: 36px 36px 28px 36px;">
              <h1 style="margin: 0 0 12px 0; font-size: 22px; font-weight: 800; color: #0f172a;">Password Reset Request</h1>
              <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.6; color: #4b5563;">
                Hello <strong>%s</strong>,<br>
                We received a request to reset the password for your CarPlug Nigeria account. Enter the 6-digit recovery code below to choose a new password:
              </p>
              
              <!-- OTP Box -->
              <div style="margin: 0 0 24px 0; padding: 20px; background-color: #fef2f2; border-radius: 16px; border: 1px solid #fecaca; text-align: center;">
                <span style="font-size: 34px; font-weight: 900; letter-spacing: 8px; color: #dc2626; font-family: monospace;">%s</span>
              </div>

              <div style="margin: 0 0 20px 0; padding: 14px; background-color: #fffbeb; border-radius: 12px; border: 1px solid #fde68a;">
                <p style="margin: 0; font-size: 12px; color: #92400e; line-height: 1.5;">
                  ⚠️ <strong>Security Advisory:</strong> Never share this code with anyone. CarPlug representatives will never ask you for your verification code.
                </p>
              </div>

              <p style="margin: 0; font-size: 12px; color: #64748b; line-height: 1.5;">
                ⏰ <strong>This code expires in 15 minutes.</strong><br>
                If you did not request this password reset, please change your password immediately or contact CarPlug security.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 36px; background-color: #f8fafc; border-top: 1px solid #f1f5f9; text-align: center;">
              <p style="margin: 0; font-size: 11px; color: #94a3b8;">
                &copy; 2026 CarPlug Nigeria Ltd. Lekki Phase 1, Lagos, Nigeria.<br>
                Automated Security &amp; Identity Verification Dispatch.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`, toName, otpCode)

	return SendBrevoEmail(toEmail, toName, subject, html)
}

// SendLeadNotificationEmail notifies a seller/dealer when an inbound buyer lead or viewing request is submitted
func SendLeadNotificationEmail(toEmail, toName, buyerName, buyerPhone, buyerCity, vehicleTitle string, vehiclePrice float64, leadType, date, note string) error {
	formattedPrice := ""
	if vehiclePrice > 0 {
		formattedPrice = fmt.Sprintf("₦%s", formatPrice(vehiclePrice))
	}

	leadTypeLabel := "Vehicle Inquiry"
	switch leadType {
	case "viewing_schedule":
		leadTypeLabel = "Physical Viewing Appointment"
	case "inspection_request":
		leadTypeLabel = "Pre-Purchase Inspection Request"
	case "direct_inquiry":
		leadTypeLabel = "Direct Purchase Inquiry"
	case "concierge":
		leadTypeLabel = "Concierge Matching Lead"
	}

	subject := fmt.Sprintf("New Buyer Lead: %s is interested in your %s", buyerName, vehicleTitle)

	html := fmt.Sprintf(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Buyer Inquiry - CarPlug Nigeria</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0f172a;">
  <table width="100%%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 40px 15px;">
    <tr>
      <td align="center">
        <table width="100%%" border="0" cellspacing="0" cellpadding="0" style="max-width: 560px; background-color: #ffffff; border-radius: 24px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          <!-- Header -->
          <tr>
            <td style="padding: 28px 36px; background-color: #0f172a; text-align: center;">
              <span style="font-size: 20px; font-weight: 900; letter-spacing: 2px; color: #ffffff; text-transform: uppercase;">CARPLUG<span style="color: #3b82f6;">.NG</span></span>
              <p style="margin: 4px 0 0 0; font-size: 11px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px;">Inbound Buyer Lead Notification</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding: 36px 36px 28px 36px;">
              <div style="display: inline-block; padding: 4px 12px; background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 9999px; font-size: 11px; font-weight: 700; color: #065f46; text-transform: uppercase; margin-bottom: 16px;">
                ● %s
              </div>
              <h1 style="margin: 0 0 12px 0; font-size: 22px; font-weight: 800; color: #0f172a;">You Have a New Buyer Inquiry!</h1>
              <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.6; color: #475569;">
                Hello <strong>%s</strong>,<br>
                A verified buyer has just submitted an inquiry on your vehicle listing on CarPlug Nigeria. Here are the buyer's details:
              </p>
              
              <!-- Lead Details Card -->
              <table width="100%%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; border-radius: 16px; border: 1px solid #cbd5e1; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 16px 20px; border-bottom: 1px solid #e2e8f0;">
                    <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">Vehicle</div>
                    <div style="font-size: 15px; font-weight: 800; color: #0f172a; margin-top: 2px;">%s <span style="color: #2563eb;">%s</span></div>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 14px 20px; border-bottom: 1px solid #e2e8f0;">
                    <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">Buyer Name</div>
                    <div style="font-size: 14px; font-weight: 700; color: #0f172a; margin-top: 2px;">%s</div>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 14px 20px; border-bottom: 1px solid #e2e8f0;">
                    <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">Buyer Phone / WhatsApp</div>
                    <div style="font-size: 15px; font-weight: 800; color: #047857; margin-top: 2px; font-family: monospace;">%s</div>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 14px 20px; border-bottom: 1px solid #e2e8f0;">
                    <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">Preferred Date / Schedule</div>
                    <div style="font-size: 14px; font-weight: 600; color: #0f172a; margin-top: 2px;">%s</div>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 14px 20px;">
                    <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">Buyer Message / Note</div>
                    <div style="font-size: 13px; font-style: italic; color: #334155; margin-top: 2px;">&ldquo;%s&rdquo;</div>
                  </td>
                </tr>
              </table>

              <!-- Call to Action -->
              <table width="100%%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 24px;">
                <tr>
                  <td align="center">
                    <a href="tel:%s" style="display: inline-block; padding: 14px 28px; background-color: #0f172a; color: #ffffff; text-decoration: none; font-weight: 800; font-size: 14px; border-radius: 14px; margin-right: 8px;">
                      Call Buyer Directly
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 0; font-size: 12px; color: #64748b; line-height: 1.5; text-align: center;">
                💡 <em>Pro-tip: Sellers who respond to buyer inquiries within 15 minutes have an 85%% higher conversion rate.</em>
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 36px; background-color: #f8fafc; border-top: 1px solid #f1f5f9; text-align: center;">
              <p style="margin: 0; font-size: 11px; color: #94a3b8;">
                &copy; 2026 CarPlug Nigeria Ltd. Automated Lead Routing Service.<br>
                Empowering safe, transparent, verified vehicle transactions across Nigeria.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
		leadTypeLabel,
		toName,
		vehicleTitle,
		formattedPrice,
		buyerName,
		buyerPhone,
		date,
		note,
		buyerPhone,
	)

	return SendBrevoEmail(toEmail, toName, subject, html)
}

// SendNewMessageNotificationEmail alerts a user when they receive an in-app message
func SendNewMessageNotificationEmail(toEmail, toName, senderName, vehicleTitle, messageBody string) error {
	subject := fmt.Sprintf("New Message from %s regarding %s", senderName, vehicleTitle)

	html := fmt.Sprintf(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Message on CarPlug</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0f172a;">
  <table width="100%%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 40px 15px;">
    <tr>
      <td align="center">
        <table width="100%%" border="0" cellspacing="0" cellpadding="0" style="max-width: 520px; background-color: #ffffff; border-radius: 24px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          <tr>
            <td style="padding: 28px 36px; background-color: #0f172a; text-align: center;">
              <span style="font-size: 20px; font-weight: 900; letter-spacing: 2px; color: #ffffff; text-transform: uppercase;">CARPLUG<span style="color: #3b82f6;">.NG</span></span>
              <p style="margin: 4px 0 0 0; font-size: 11px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px;">In-App Message Alert</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 36px 36px 28px 36px;">
              <h1 style="margin: 0 0 12px 0; font-size: 20px; font-weight: 800; color: #0f172a;">New Message from %s</h1>
              <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 1.6; color: #475569;">
                Hello <strong>%s</strong>,<br>
                You have received a new message regarding <strong>%s</strong>:
              </p>
              
              <div style="margin: 0 0 24px 0; padding: 18px; background-color: #f1f5f9; border-radius: 16px; border: 1px solid #cbd5e1; font-size: 14px; color: #1e293b; line-height: 1.6; font-style: italic;">
                &ldquo;%s&rdquo;
              </div>

              <p style="margin: 0; font-size: 12px; color: #64748b; line-height: 1.5; text-align: center;">
                Log in to your CarPlug dashboard to view the complete conversation and reply in real time.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 36px; background-color: #f8fafc; border-top: 1px solid #f1f5f9; text-align: center;">
              <p style="margin: 0; font-size: 11px; color: #94a3b8;">
                &copy; 2026 CarPlug Nigeria Ltd. Instant Messaging Notification Service.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
		senderName,
		toName,
		vehicleTitle,
		messageBody,
	)

	return SendBrevoEmail(toEmail, toName, subject, html)
}

func formatPrice(val float64) string {
	parts := strings.Split(fmt.Sprintf("%.0f", val), ".")
	intPart := parts[0]
	n := len(intPart)
	if n <= 3 {
		return intPart
	}
	var res []string
	remainder := n % 3
	if remainder > 0 {
		res = append(res, intPart[:remainder])
	}
	for i := remainder; i < n; i += 3 {
		res = append(res, intPart[i:i+3])
	}
	return strings.Join(res, ",")
}

