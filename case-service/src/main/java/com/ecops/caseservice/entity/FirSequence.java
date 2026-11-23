package com.ecops.caseservice.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "fir_sequence")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class FirSequence {

    @EmbeddedId
    private FirSequenceId id;

    @Column(name = "last_seq", nullable = false)
    private Integer lastSeq = 0;

    @Embeddable
    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @EqualsAndHashCode
    public static class FirSequenceId implements java.io.Serializable {
        @Column(name = "station_code", length = 20)
        private String stationCode;

        @Column(name = "year")
        private Integer year;
    }
}
