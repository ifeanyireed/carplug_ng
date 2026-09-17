package controllers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/ifeanyireed/carplug_ng/backend/config"
	"github.com/ifeanyireed/carplug_ng/backend/utils"
)

type ValuationRequest struct {
	Make        string  `json:"make"`
	Model       string  `json:"model"`
	Year        int     `json:"year"`
	Condition   string  `json:"condition"`
	Mileage     int     `json:"mileage"`
	AskingPrice float64 `json:"askingPrice"`
}

// EstimateValuation computes dynamic fair-market range and Nigerian automotive comps
func EstimateValuation(c *gin.Context) {
	db := config.GetDB()

	var req ValuationRequest

	// Bind from JSON body if present, else read query params
	if c.Request.Method == http.MethodPost {
		_ = c.ShouldBindJSON(&req)
	}

	if req.Make == "" {
		req.Make = c.Query("make")
	}
	if req.Model == "" {
		req.Model = c.Query("model")
	}
	if req.Year == 0 {
		if y, err := strconv.Atoi(c.Query("year")); err == nil {
			req.Year = y
		} else {
			req.Year = 2018
		}
	}
	if req.Condition == "" {
		req.Condition = c.DefaultQuery("condition", "Foreign Used (Tokunbo)")
	}
	if req.Mileage == 0 {
		if m, err := strconv.Atoi(c.Query("mileage")); err == nil {
			req.Mileage = m
		}
	}
	if req.AskingPrice == 0 {
		if p, err := strconv.ParseFloat(c.Query("askingPrice"), 64); err == nil {
			req.AskingPrice = p
		} else if p, err := strconv.ParseFloat(c.Query("price"), 64); err == nil {
			req.AskingPrice = p
		}
	}

	if req.Make == "" {
		req.Make = "Toyota"
	}
	if req.Model == "" {
		req.Model = "Corolla"
	}

	result := utils.CalculateValuation(db, req.Make, req.Model, req.Year, req.Condition, req.Mileage, req.AskingPrice)

	c.JSON(http.StatusOK, gin.H{
		"status": "success",
		"data":   result,
	})
}
