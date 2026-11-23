package com.nesha.backend.repository;

import com.nesha.backend.entity.PrestadorPerfil;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PrestadorPerfilRepository extends JpaRepository<PrestadorPerfil, UUID> {

    Optional<PrestadorPerfil> findByUsuarioId(UUID usuarioId);

    // Catálogo: só quem está recebendo solicitações (selo "Online").
    List<PrestadorPerfil> findByOnlineTrue();

    List<PrestadorPerfil> findByOnlineTrueAndServicoPrincipalIn(Collection<String> servicos);
}
