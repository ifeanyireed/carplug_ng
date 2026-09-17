package middleware

import (
	"net/http"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
)

type ipBucket struct {
	count int
	reset time.Time
}

type rateLimiter struct {
	mu      sync.Mutex
	buckets map[string]*ipBucket
	limit   int
	window  time.Duration
}

func newRateLimiter(limit int, window time.Duration) *rateLimiter {
	rl := &rateLimiter{
		buckets: make(map[string]*ipBucket),
		limit:   limit,
		window:  window,
	}

	// Periodic sweep to evict expired buckets and prevent memory leaks
	go func() {
		ticker := time.NewTicker(window * 2)
		defer ticker.Stop()
		for range ticker.C {
			rl.mu.Lock()
			now := time.Now()
			for ip, b := range rl.buckets {
				if now.After(b.reset) {
					delete(rl.buckets, ip)
				}
			}
			rl.mu.Unlock()
		}
	}()

	return rl
}

func (rl *rateLimiter) Middleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		ip := c.ClientIP()
		now := time.Now()

		rl.mu.Lock()
		b, ok := rl.buckets[ip]
		if !ok || now.After(b.reset) {
			b = &ipBucket{count: 0, reset: now.Add(rl.window)}
			rl.buckets[ip] = b
		}

		b.count++
		if b.count > rl.limit {
			rl.mu.Unlock()
			c.JSON(http.StatusTooManyRequests, gin.H{
				"error": "too many requests, please try again later",
			})
			c.Abort()
			return
		}
		rl.mu.Unlock()

		c.Next()
	}
}

// RateLimit returns a Gin middleware that limits requests per client IP within a rolling time window.
func RateLimit(requests int, window time.Duration) gin.HandlerFunc {
	rl := newRateLimiter(requests, window)
	return rl.Middleware()
}
