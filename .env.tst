# Test environment (.env.tst)
# Mix of real and mock integrations
NODE_ENV=test
BASE_URL=http://localhost:3000
DATABASE_URL=postgres://postgres:postgres@localhost:5432/theurllist_test
API_VERSION=v1
TEST_TYPES=unit,api,e2e

# Database and API are real, auth and external services are mocked
# No need to force any settings - will use environment configuration