package com.ecops.authadmin.repository;

import com.ecops.authadmin.entity.UserShadow;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserShadowRepository extends JpaRepository<UserShadow, String> {
    Optional<UserShadow> findByEmail(String email);
    Optional<UserShadow> findByUsername(String username);
}
