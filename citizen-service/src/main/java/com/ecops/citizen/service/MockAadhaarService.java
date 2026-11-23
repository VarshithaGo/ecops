package com.ecops.citizen.service;

import org.springframework.stereotype.Service;

@Service
public class MockAadhaarService {

    public boolean verify(String aadhaarRef) {
        if (aadhaarRef == null || !aadhaarRef.matches("\\d{12}")) {
            return false;
        }
        // Simple digit-sum rule: sum of all 12 digits must be divisible by 7
        int sum = 0;
        for (char c : aadhaarRef.toCharArray()) {
            sum += c - '0';
        }
        return sum % 7 == 0;
    }
}
