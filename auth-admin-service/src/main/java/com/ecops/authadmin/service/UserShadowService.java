package com.ecops.authadmin.service;

import com.ecops.authadmin.dto.UserSyncRequest;
import com.ecops.authadmin.entity.UserShadow;
import com.ecops.authadmin.repository.UserShadowRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;

@Service
@RequiredArgsConstructor
public class UserShadowService {

    private final UserShadowRepository shadowRepository;

    @Transactional
    public void sync(UserSyncRequest req) {
        UserShadow shadow = shadowRepository.findById(req.id()).orElse(new UserShadow());
        shadow.setId(req.id());
        shadow.setUsername(req.username());
        shadow.setEmail(req.email());
        shadow.setFullName(req.fullName());
        shadow.setRole(req.role());
        shadow.setSyncedAt(OffsetDateTime.now());
        shadowRepository.save(shadow);
    }

    @Transactional(readOnly = true)
    public UserShadow getById(String id) {
        return shadowRepository.findById(id)
                .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("User not found: " + id));
    }
}
