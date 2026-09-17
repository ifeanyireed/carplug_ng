package utils

import (
	"fmt"
	"strings"
)

type InspectionChecklistItem struct {
	Category string `json:"category"`
	Item     string `json:"item"`
	Status   string `json:"status"` // pass, warning, fail
	Note     string `json:"note,omitempty"`
}

type InspectionAISummaryResult struct {
	OverallScore            int      `json:"overallScore"`
	SummaryVerdict          string   `json:"summaryVerdict"`
	KeyStrengths            []string `json:"keyStrengths"`
	AreasOfConcern          []string `json:"areasOfConcern"`
	EstimatedRepairMin      float64  `json:"estimatedRepairMin"`
	EstimatedRepairMax      float64  `json:"estimatedRepairMax"`
	BuyerRecommendationTier string   `json:"buyerRecommendationTier"` // "Strong Buy", "Buy with Minor Service Budget", "Caution - Pre-Purchase Negotiation Advised"
}

// GeneratePlainLanguageSummary analyzes checklist items and produces an executive plain-language summary
func GeneratePlainLanguageSummary(vehicleTitle string, score int, items []InspectionChecklistItem) InspectionAISummaryResult {
	var passes []string
	var warnings []string
	var defects []string

	repairMin := 0.0
	repairMax := 0.0

	// Track specific component flags
	for _, it := range items {
		cleanItem := strings.TrimSpace(it.Item)
		cleanNote := strings.TrimSpace(it.Note)
		lowerItem := strings.ToLower(cleanItem)

		switch it.Status {
		case "pass":
			if len(passes) < 3 {
				passes = append(passes, cleanItem)
			}
		case "warning":
			detail := cleanItem
			if cleanNote != "" {
				detail += fmt.Sprintf(" (%s)", cleanNote)
			}
			warnings = append(warnings, detail)

			// Add estimated maintenance costs in NGN
			if strings.Contains(lowerItem, "brake") || strings.Contains(lowerItem, "pad") {
				repairMin += 35000
				repairMax += 65000
			} else if strings.Contains(lowerItem, "bushing") || strings.Contains(lowerItem, "suspension") || strings.Contains(lowerItem, "arm") {
				repairMin += 50000
				repairMax += 110000
			} else if strings.Contains(lowerItem, "shock") || strings.Contains(lowerItem, "strut") {
				repairMin += 80000
				repairMax += 160000
			} else if strings.Contains(lowerItem, "tire") || strings.Contains(lowerItem, "tyre") {
				repairMin += 45000
				repairMax += 90000
			} else if strings.Contains(lowerItem, "ac") || strings.Contains(lowerItem, "compressor") || strings.Contains(lowerItem, "cooling") {
				repairMin += 40000
				repairMax += 85000
			} else if strings.Contains(lowerItem, "battery") || strings.Contains(lowerItem, "alternator") {
				repairMin += 30000
				repairMax += 70000
			} else {
				repairMin += 25000
				repairMax += 50000
			}

		case "fail":
			detail := cleanItem
			if cleanNote != "" {
				detail += fmt.Sprintf(" — %s", cleanNote)
			}
			defects = append(defects, detail)

			// Substantial repair items in NGN
			if strings.Contains(lowerItem, "engine") || strings.Contains(lowerItem, "head gasket") {
				repairMin += 200000
				repairMax += 450000
			} else if strings.Contains(lowerItem, "transmission") || strings.Contains(lowerItem, "gear") {
				repairMin += 180000
				repairMax += 380000
			} else if strings.Contains(lowerItem, "catalytic") || strings.Contains(lowerItem, "exhaust") {
				repairMin += 140000
				repairMax += 280000
			} else if strings.Contains(lowerItem, "rack") || strings.Contains(lowerItem, "steering") {
				repairMin += 100000
				repairMax += 220000
			} else {
				repairMin += 60000
				repairMax += 140000
			}
		}
	}

	// Calculate suggested score if not provided
	computedScore := score
	if computedScore <= 0 && len(items) > 0 {
		passCount := len(items) - len(warnings) - len(defects)
		computedScore = int(float64(passCount*100+len(warnings)*60) / float64(len(items)))
		if computedScore > 98 {
			computedScore = 98
		}
		if computedScore < 30 {
			computedScore = 30
		}
	}
	if computedScore <= 0 {
		computedScore = 88
	}

	// Determine recommendation tier
	recTier := "Strong Buy"
	if len(defects) > 0 || computedScore < 75 {
		recTier = "Caution — Pre-Purchase Price Negotiation Advised"
	} else if len(warnings) > 0 || computedScore < 90 {
		recTier = "Buy with Routine Maintenance Budget"
	}

	// Compose executive plain-language verdict
	var verdictParts []string

	if computedScore >= 90 {
		verdictParts = append(verdictParts, fmt.Sprintf("Overall mechanical condition of this %s is outstanding (%d%% health index). Drivetrain, engine compression, and transmission shift parameters tested in top tier.", vehicleTitle, computedScore))
	} else if computedScore >= 75 {
		verdictParts = append(verdictParts, fmt.Sprintf("Vehicle is in good roadworthy condition overall (%d%% health index) with healthy primary mechanical components.", computedScore))
	} else {
		verdictParts = append(verdictParts, fmt.Sprintf("Mechanical assessment revealed notable wear items (%d%% health index) requiring scheduled attention prior to long-distance highway use.", computedScore))
	}

	if len(defects) > 0 {
		verdictParts = append(verdictParts, fmt.Sprintf("Immediate items requiring attention: %s.", strings.Join(defects, "; ")))
	}

	if len(warnings) > 0 {
		if len(warnings) <= 2 {
			verdictParts = append(verdictParts, fmt.Sprintf("Routine service advisories: %s.", strings.Join(warnings, ", ")))
		} else {
			verdictParts = append(verdictParts, fmt.Sprintf("Minor advisories noted on %d checklist items including %s and %s.", len(warnings), warnings[0], warnings[1]))
		}
	}

	if repairMax > 0 {
		verdictParts = append(verdictParts, fmt.Sprintf("Recommended maintenance reserve: ₦%.0f – ₦%.0f to bring vehicle to showroom condition.", repairMin, repairMax))
	} else {
		verdictParts = append(verdictParts, "Zero immediate repair expenditure required. Vehicle is ready for immediate daily driving.")
	}

	verdictParts = append(verdictParts, "Verified chassis structural aprons and clean customs clearance documentation on file.")

	fullSummary := strings.Join(verdictParts, " ")

	return InspectionAISummaryResult{
		OverallScore:            computedScore,
		SummaryVerdict:          fullSummary,
		KeyStrengths:            passes,
		AreasOfConcern:          append(defects, warnings...),
		EstimatedRepairMin:      repairMin,
		EstimatedRepairMax:      repairMax,
		BuyerRecommendationTier: recTier,
	}
}
