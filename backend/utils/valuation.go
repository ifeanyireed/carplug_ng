package utils

import (
	"fmt"
	"math"
	"sort"
	"strings"
	"time"

	"gorm.io/gorm"
)

// ValuationResult represents the computed market valuation and price intelligence
type ValuationResult struct {
	Make                string   `json:"make"`
	Model               string   `json:"model"`
	Year                int      `json:"year"`
	Condition           string   `json:"condition"`
	Mileage             int      `json:"mileage"`
	MarketPriceMin      float64  `json:"marketPriceMin"`
	MarketPriceMax      float64  `json:"marketPriceMax"`
	MedianPrice         float64  `json:"medianPrice"`
	PriceRating         string   `json:"priceRating"` // great, good, fair, high
	PriceVerdict        string   `json:"priceVerdict"`
	CompsCount          int      `json:"compsCount"`
	DealerCashOfferMin  float64  `json:"dealerCashOfferMin"`
	DealerCashOfferMax  float64  `json:"dealerCashOfferMax"`
	ConfidenceScore     int      `json:"confidenceScore"` // 0 - 100%
}

// VehiclePeerComp holds simplified price/mileage from database
type VehiclePeerComp struct {
	Price   float64
	Mileage int
	Year    int
}

// BrandBaseline holds representative 2021 Tokunbo baseline prices in NGN
var brandModelBaselines = map[string]map[string]float64{
	"toyota": {
		"corolla":    15500000,
		"camry":      18500000,
		"rav4":       28500000,
		"highlander": 32000000,
		"prado":      65000000,
		"avalon":     22000000,
		"venza":      21000000,
		"sienna":     20000000,
		"hilux":      38000000,
		"tacoma":     36000000,
		"tundra":     48000000,
		"yaris":      11000000,
	},
	"lexus": {
		"rx 350":  32000000,
		"rx":      32000000,
		"es 350":  23000000,
		"es":      23000000,
		"gx 460":  55000000,
		"gx":      55000000,
		"lx 570":  85000000,
		"lx":      95000000,
		"is 250":  16000000,
		"is 350":  19500000,
		"nx 200t": 26000000,
		"nx":      27000000,
	},
	"mercedes-benz": {
		"c 300":   24000000,
		"c-class": 24000000,
		"e 350":   30000000,
		"e-class": 30000000,
		"glc 300": 42000000,
		"glc":     42000000,
		"gle 350": 52000000,
		"gle 450": 68000000,
		"gle":     55000000,
		"g 63":    145000000,
		"g-wagon": 145000000,
		"cla 250": 21000000,
		"s 550":   62000000,
	},
	"honda": {
		"accord": 14500000,
		"civic":  13000000,
		"cr-v":   20500000,
		"pilot":  24000000,
	},
	"ford": {
		"explorer": 22000000,
		"edge":     17500000,
		"f-150":    34000000,
		"mustang":  26000000,
	},
	"hyundai": {
		"elantra":  11000000,
		"sonata":   13500000,
		"tucson":   18000000,
		"santa fe": 21000000,
	},
	"kia": {
		"cerato":  10500000,
		"optima":  13000000,
		"sportage": 18000000,
		"sorento": 21500000,
	},
}

// CalculateValuation computes dynamic pricing intelligence using database comps and depreciation modeling
func CalculateValuation(db *gorm.DB, makeName, modelName string, year int, condition string, mileage int, askingPrice float64) ValuationResult {
	currentYear := time.Now().Year()
	if currentYear < 2026 {
		currentYear = 2026 // Calibrate to current project timeline
	}
	if year <= 1990 {
		year = 2018
	}

	normMake := strings.ToLower(strings.TrimSpace(makeName))
	normModel := strings.ToLower(strings.TrimSpace(modelName))

	// 1. Query Database Comps
	var dbComps []VehiclePeerComp
	compsCount := 0
	if db != nil {
		type compRow struct {
			Price   float64
			Mileage int
			Year    int
		}
		var rows []compRow
		err := db.Table("vehicles").
			Select("price, mileage, year").
			Where("LOWER(make) = ? AND (LOWER(model) LIKE ? OR ? LIKE CONCAT('%', LOWER(model), '%')) AND year BETWEEN ? AND ? AND price > 0",
				normMake, "%"+normModel+"%", normModel, year-1, year+1).
			Limit(50).
			Scan(&rows).Error

		if err == nil && len(rows) > 0 {
			compsCount = len(rows)
			for _, r := range rows {
				dbComps = append(dbComps, VehiclePeerComp{
					Price:   r.Price,
					Mileage: r.Mileage,
					Year:    r.Year,
				})
			}
		}
	}

	// 2. Base Algorithmic Anchor
	baseline2021 := 18000000.0 // Default sedan/crossover anchor
	if modelsMap, ok := brandModelBaselines[normMake]; ok {
		// Exact match
		if base, match := modelsMap[normModel]; match {
			baseline2021 = base
		} else {
			// Substring match
			found := false
			for k, v := range modelsMap {
				if strings.Contains(normModel, k) || strings.Contains(k, normModel) {
					baseline2021 = v
					found = true
					break
				}
			}
			if !found {
				// Average for the brand
				sum := 0.0
				for _, v := range modelsMap {
					sum += v
				}
				if len(modelsMap) > 0 {
					baseline2021 = sum / float64(len(modelsMap))
				}
			}
		}
	}

	// 3. Year Depreciation Curve (relative to 2021 baseline)
	yearDiff := year - 2021
	yearMultiplier := 1.0
	if yearDiff > 0 {
		// Newer car: +11% per year
		yearMultiplier = math.Pow(1.11, float64(yearDiff))
	} else if yearDiff < 0 {
		// Older car: -8.5% per year
		yearMultiplier = math.Pow(0.915, float64(-yearDiff))
	}
	modelEstimatedPrice := baseline2021 * yearMultiplier

	// 4. Condition Adjustments
	conditionLower := strings.ToLower(condition)
	conditionFactor := 1.0
	if strings.Contains(conditionLower, "nigerian") || strings.Contains(conditionLower, "local") {
		conditionFactor = 0.68 // ~32% discount for Nigerian used vs Tokunbo
	} else if strings.Contains(conditionLower, "brand new") {
		conditionFactor = 1.55 // +55% for 0km new
	} else {
		conditionFactor = 1.0 // Foreign Used (Tokunbo) baseline
	}
	modelEstimatedPrice *= conditionFactor

	// 5. Mileage Depreciation Factor
	age := currentYear - year
	if age < 1 {
		age = 1
	}
	expectedKm := age * 16000
	if mileage > 0 {
		mileageDiff := mileage - expectedKm
		if mileageDiff > 0 {
			// Higher mileage discount: -₦120,000 per 10,000km excess (capped at -15%)
			penaltyPct := math.Min(0.15, (float64(mileageDiff)/10000.0)*0.012)
			modelEstimatedPrice *= (1.0 - penaltyPct)
		} else if mileageDiff < 0 {
			// Low mileage premium: +₦100,000 per 10,000km below expected (capped at +10%)
			bonusPct := math.Min(0.10, (float64(-mileageDiff)/10000.0)*0.010)
			modelEstimatedPrice *= (1.0 + bonusPct)
		}
	}

	// 6. DB Comps Blending
	finalMedian := modelEstimatedPrice
	confidence := 65 // Base confidence for algorithmic estimate
	if compsCount >= 2 {
		prices := make([]float64, len(dbComps))
		for i, c := range dbComps {
			prices[i] = c.Price
		}
		sort.Float64s(prices)

		dbMedian := 0.0
		n := len(prices)
		if n%2 == 0 {
			dbMedian = (prices[n/2-1] + prices[n/2]) / 2.0
		} else {
			dbMedian = prices[n/2]
		}

		// Weight DB comps 65% + 35% algorithm
		finalMedian = (dbMedian * 0.65) + (modelEstimatedPrice * 0.35)
		confidence = int(math.Min(95, float64(70+(compsCount*3))))
	}

	// Spread: ±6.5% for market bounds
	marketPriceMin := math.Round((finalMedian*0.935)/50000.0) * 50000.0
	marketPriceMax := math.Round((finalMedian*1.065)/50000.0) * 50000.0
	finalMedian = math.Round(finalMedian/50000.0) * 50000.0

	// 7. Evaluate Asking Price vs Market Range
	targetPrice := askingPrice
	if targetPrice <= 0 {
		targetPrice = finalMedian
	}

	priceRating := "good"
	priceVerdict := ""

	formattedMedianM := finalMedian / 1000000.0
	formattedTargetM := targetPrice / 1000000.0

	if targetPrice < marketPriceMin*0.96 {
		priceRating = "great"
		diffM := (marketPriceMin - targetPrice) / 1000000.0
		priceVerdict = fmt.Sprintf("Great Deal: ₦%.1fM below expected market range (Median ₦%.1fM). Exceptional value for a %d %s %s in %s condition.",
			diffM, formattedMedianM, year, makeName, modelName, condition)
	} else if targetPrice > marketPriceMax*1.04 {
		priceRating = "high"
		diffM := (targetPrice - marketPriceMax) / 1000000.0
		priceVerdict = fmt.Sprintf("Above Market: ₦%.1fM above typical comps (Median ₦%.1fM). Justified primarily for single-owner history or Tier 5 Master Inspection certification.",
			diffM, formattedMedianM)
	} else {
		priceRating = "good"
		priceVerdict = fmt.Sprintf("Fair Market Value: ₦%.1fM aligns with verified transactions for comparable %d %s %s models in Lagos and Abuja.",
			formattedTargetM, year, makeName, modelName)
	}

	// 8. Dealer Cash Offer Estimates (typically 82% - 88% of market value for instant cashout)
	dealerOfferMin := math.Round((finalMedian*0.82)/50000.0) * 50000.0
	dealerOfferMax := math.Round((finalMedian*0.88)/50000.0) * 50000.0

	return ValuationResult{
		Make:               makeName,
		Model:              modelName,
		Year:               year,
		Condition:          condition,
		Mileage:            mileage,
		MarketPriceMin:     marketPriceMin,
		MarketPriceMax:     marketPriceMax,
		MedianPrice:        finalMedian,
		PriceRating:        priceRating,
		PriceVerdict:       priceVerdict,
		CompsCount:         compsCount,
		DealerCashOfferMin: dealerOfferMin,
		DealerCashOfferMax: dealerOfferMax,
		ConfidenceScore:    confidence,
	}
}
