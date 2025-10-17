# Debugging OpenRouter API Issue

**Problem:** Planning agent got "No response from API"

## 🔍 Step-by-Step Debugging

### 1. Verify API Key is Set

```bash
echo $OPENROUTER_API_KEY
# Should show: sk-or-v1-...
```

**If empty:**
```bash
export OPENROUTER_API_KEY="sk-or-v1-your-key-here"
```

---

### 2. Test API Key Works

```bash
./TEST_API_KEY.sh
```

**Expected output:**
```
✅ API KEY WORKS!
Model: google/gemini-2.0-flash-001:free
Tokens used: 15
Status: Ready to use!
```

**If error:**
- Check error message
- Review saved response: `cat /tmp/openrouter-error.json`
- Common issues:
  - Invalid API key format
  - Need to verify email
  - Rate limit (wait 1 minute)
  - Network issue

---

### 3. Manual API Test

```bash
# Test with curl directly
curl https://openrouter.ai/api/v1/chat/completions \
  -H "Authorization: Bearer $OPENROUTER_API_KEY" \
  -H "Content-Type: application/json" \
  -H "HTTP-Referer: https://github.com/test" \
  -H "X-Title: Test" \
  -d '{
    "model": "google/gemini-2.0-flash-001:free",
    "messages": [{"role": "user", "content": "Say hello"}]
  }' | jq .
```

**Look for:**
- `.choices[0].message.content` (should have text)
- `.error.message` (should be null/empty)

---

### 4. Check OpenRouter Dashboard

Visit: https://openrouter.ai/activity

**Verify:**
- API key is active
- You have credits (free tier should work)
- No rate limit warnings
- API calls are being received

---

### 5. Try Different Model

If free tier has issues, try a paid model:

```bash
# Edit agents/lib.sh, change default model:
call_openrouter() {
    local prompt="$1"
    local model="${2:-openai/gpt-3.5-turbo}"  # Changed from gemini:free
    ...
}
```

---

## 🐛 Common Issues

### Issue 1: "Invalid API key"

**Solution:**
- Get new key from https://openrouter.ai/keys
- Format should be: `sk-or-v1-...`
- Verify no extra spaces when setting

### Issue 2: "Rate limit exceeded"

**Solution:**
- Wait 60 seconds
- Free tier has rate limits (10 requests/minute)
- Upgrade to paid tier for higher limits

### Issue 3: "Model not found"

**Solution:**
- Check model is available: https://openrouter.ai/models
- Use different model (see lib.sh for options)
- Free models: gemini:free, llama:free
- Paid models: claude, gpt-4o

### Issue 4: Empty response (no error)

**Solution:**
- Check /tmp/openrouter-error.json
- May be timeout (long prompt, slow model)
- Try shorter prompt
- Try faster model

---

## ✅ Quick Fix

**If nothing works, try this:**

```bash
# Use a known-working model
export OPENROUTER_MODEL="openai/gpt-3.5-turbo"

# Test with minimal prompt
curl https://openrouter.ai/api/v1/chat/completions \
  -H "Authorization: Bearer $OPENROUTER_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "openai/gpt-3.5-turbo",
    "messages": [{"role": "user", "content": "hi"}]
  }' | jq .choices[0].message.content
```

**Should print:** "Hello! How can I assist you today?"

**If that works:** API key is fine, issue is with model or prompt size.

---

## 📞 Need Help?

Check saved error:
```bash
cat /tmp/openrouter-error.json | jq .
```

Enable debug mode:
```bash
DEBUG=1 ./TEST_API_KEY.sh
```

---

**Most likely issue:** Need to verify email or wait for rate limit reset.

**Try:** Wait 1 minute, then run `./TEST_API_KEY.sh` again.

