package com.nesha.backend.repository;

import com.nesha.backend.entity.PrestadorPerfil;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PrestadorPerfilRepository extends JpaRepository<PrestadorPerfil, UUID> {

    Optional<PrestadorPerfil> findByUsuarioId(UUID usuarioId);
}
