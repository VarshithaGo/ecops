package com.ecops.authadmin.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.OffsetDateTime;

@Entity
@Table(name = "users_shadow")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class UserShadow {

    @Id
    @Column(length = 255)
    private String id;

    @Column(nullable = false, unique = true, length = 255)
    private String username;

    @Column(nullable = false, unique = true, length = 255)
    private String email;

    @Column(name = "full_name", length = 255)
    private String fullName;

    @Column(nullable = false, length = 50)
    private String role;

    @CreationTimestamp
    @Column(name = "synced_at", updatable = false)
    private OffsetDateTime syncedAt;
}
