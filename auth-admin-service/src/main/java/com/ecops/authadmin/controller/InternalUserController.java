package com.ecops.authadmin.controller;

import com.ecops.authadmin.dto.AssignmentResponse;
import com.ecops.authadmin.dto.UserSyncRequest;
import com.ecops.authadmin.service.OfficerAssignmentService;
import com.ecops.authadmin.service.UserShadowService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/internal")
@RequiredArgsConstructor
public class InternalUserController {

    private final OfficerAssignmentService assignmentService;
    private final UserShadowService userShadowService;

    @GetMapping("/users/{keycloakId}")
    public AssignmentResponse getOfficerDetails(@PathVariable String keycloakId) {
        return assignmentService.getActiveByOfficer(keycloakId);
    }

    @PostMapping("/users/sync")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void syncUser(@Valid @RequestBody UserSyncRequest req) {
        userShadowService.sync(req);
    }
}
