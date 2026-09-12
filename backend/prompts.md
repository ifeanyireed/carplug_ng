Run all commands from the repo root (the folder containing both backend/
and web_app/). There's a file called LEAD_OWNERSHIP_FIX.md — read it and
apply the fix. After, run the manual two-account test described and paste
me the actual 403 response, then:

cd backend && go build ./... && go vet ./...
