import urllib.request
import urllib.error
import json
import sys

BASE_URL = "http://127.0.0.1:8000/api"

def make_req(path, method="GET", data=None, token=None):
    url = f"{BASE_URL}{path}"
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    body = json.dumps(data).encode("utf-8") if data is not None else None
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as resp:
            status = resp.status
            content = resp.read().decode("utf-8")
            try:
                parsed = json.loads(content)
            except:
                parsed = content
            return status, parsed
    except urllib.error.HTTPError as e:
        content = e.read().decode("utf-8")
        try:
            parsed = json.loads(content)
        except:
            parsed = content
        return e.code, parsed
    except Exception as e:
        return 0, str(e)

def main():
    print("=== ICU SHARE FULL-STACK AUTHENTICATION E2E TEST ===")
    
    # 1. Test direct unauthenticated access to protected routes
    print("\n--- 1. Testing Unauthenticated Access to Protected Routes ---")
    status, body = make_req("/hospital/dashboard")
    print(f"GET /hospital/dashboard (unauthenticated): Status {status} ->", body)
    assert status == 401, f"Expected 401, got {status}"

    status, body = make_req("/hospital/bookings")
    print(f"GET /hospital/bookings (unauthenticated): Status {status} ->", body)
    assert status == 401, f"Expected 401, got {status}"

    status, body = make_req("/user/bookings")
    print(f"GET /user/bookings (unauthenticated): Status {status} ->", body)
    assert status == 401, f"Expected 401, got {status}"

    # 2. Test valid USER login
    print("\n--- 2. Testing USER Login with Demo Credentials ---")
    status, body = make_req("/auth/user/login", method="POST", data={
        "email": "user@icushare.org",
        "password": "UserPass123!"
    })
    print(f"POST /auth/user/login: Status {status}")
    assert status == 200, f"Expected 200, got {status}"
    assert body.get("role") == "USER"
    assert "access_token" in body
    user_token = body["access_token"]
    print(f"Logged in as User: ID {body['user']['id']}, Name: {body['user']['name']}")

    # 3. Test USER /auth/me
    print("\n--- 3. Testing /auth/me for User Session ---")
    status, body = make_req("/auth/me", token=user_token)
    print(f"GET /auth/me with User Token: Status {status} -> Role: {body.get('role')}")
    assert status == 200 and body.get("role") == "USER"

    # 4. Test Cross-Role: USER attempting Hospital-only routes
    print("\n--- 4. Testing Cross-Role Restriction (USER -> Hospital Routes) ---")
    status, body = make_req("/hospital/dashboard", token=user_token)
    print(f"GET /hospital/dashboard with User Token: Status {status} ->", body)
    assert status == 401, f"Expected 401, got {status}"

    status, body = make_req("/hospital/bookings", token=user_token)
    print(f"GET /hospital/bookings with User Token: Status {status} ->", body)
    assert status == 401, f"Expected 401, got {status}"

    # 5. Test valid HOSPITAL login
    print("\n--- 5. Testing HOSPITAL Login with Institutional Credentials ---")
    status, body = make_req("/auth/hospital/login", method="POST", data={
        "registration_id": "TN-CMC-APOLLO-9021",
        "password": "HospitalPass123!"
    })
    print(f"POST /auth/hospital/login: Status {status}")
    assert status == 200, f"Expected 200, got {status}"
    assert body.get("role") == "HOSPITAL"
    assert "access_token" in body
    hosp_token = body["access_token"]
    print(f"Logged in as Hospital: ID {body['hospital']['id']}, Name: {body['hospital']['name']}")

    # 6. Test HOSPITAL /auth/me
    print("\n--- 6. Testing /auth/me for Hospital Session ---")
    status, body = make_req("/auth/me", token=hosp_token)
    print(f"GET /auth/me with Hospital Token: Status {status} -> Role: {body.get('role')}")
    assert status == 200 and body.get("role") == "HOSPITAL"

    # 7. Test Cross-Role: HOSPITAL attempting User-only routes
    print("\n--- 7. Testing Cross-Role Restriction (HOSPITAL -> User Routes) ---")
    status, body = make_req("/user/bookings", token=hosp_token)
    print(f"GET /user/bookings with Hospital Token: Status {status} ->", body)
    assert status == 401, f"Expected 401, got {status}"

    # 8. Test Invalid / Expired Token
    print("\n--- 8. Testing Invalid and Expired Tokens ---")
    status, body = make_req("/auth/me", token="invalid.fake.jwt")
    print(f"GET /auth/me with Tampered Token: Status {status} ->", body)
    assert status == 401, f"Expected 401, got {status}"

    # 9. Test Hospital Dashboard and Beds under Authenticated Hospital Session
    print("\n--- 9. Testing Hospital Operations with Hospital Token ---")
    status, body = make_req("/hospital/dashboard", token=hosp_token)
    print(f"GET /hospital/dashboard: Status {status} -> Total Beds: {body.get('total_beds')}, Available: {body.get('available_beds')}")
    assert status == 200

    status, body = make_req("/hospital/bookings", token=hosp_token)
    print(f"GET /hospital/bookings: Status {status} -> Found {len(body)} bookings")
    assert status == 200

    # 10. Test User Bookings with User Token
    print("\n--- 10. Testing User Operations with User Token ---")
    status, body = make_req("/user/bookings", token=user_token)
    print(f"GET /user/bookings: Status {status} -> Found {len(body)} user bookings")
    assert status == 200

    print("\n=== ALL 10 E2E AUTHENTICATION CHECKS PASSED SUCCESSFULLY ===")

if __name__ == "__main__":
    main()
