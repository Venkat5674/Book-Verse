// Helper: base64url encode a string
const base64UrlEncode = (str) => {
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p1) => {
        return String.fromCharCode(parseInt(p1, 16))
    }))
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
}

// Helper: base64url decode
const base64UrlDecode = (str) => {
    let output = str.replace(/-/g, '+').replace(/_/g, '/')
    while (output.length % 4) {
        output += '='
    }
    const decoded = atob(output)
    try {
        return decodeURIComponent(
            decoded
                .split('')
                .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        )
    } catch {
        return decoded
    }
}

// Generate valid RFC 7519 structure JWT: Header.Payload.Signature
export const generateJWT = (payload) => {
    const header = {
        alg: 'HS256',
        typ: 'JWT',
    }

    const encodedHeader = base64UrlEncode(JSON.stringify(header))
    const encodedPayload = base64UrlEncode(JSON.stringify(payload))

    // Mock HMAC-SHA256 signature hash derived from payload
    const mockSignatureInput = `${encodedHeader}.${encodedPayload}.bookverse_secret_key`
    const encodedSignature = base64UrlEncode(mockSignatureInput).slice(0, 43)

    return `${encodedHeader}.${encodedPayload}.${encodedSignature}`
}

// Decode and validate token expiry
export const verifyAndDecodeJWT = (token) => {
    try {
        if (!token || typeof token !== 'string') return null
        const parts = token.split('.')
        if (parts.length !== 3) return null

        const payloadJson = base64UrlDecode(parts[1])
        const payload = JSON.parse(payloadJson)

        // Check expiration
        const currentTime = Math.floor(Date.now() / 1000)
        if (payload.exp && payload.exp < currentTime) {
            console.warn('JWT token has expired')
            return null
        }

        return payload
    } catch (err) {
        console.error('Failed to parse JWT token:', err)
        return null
    }
}
