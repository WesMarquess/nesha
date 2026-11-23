package com.nesha.backend.repository;

import com.nesha.backend.entity.UsuarioFoto;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UsuarioFotoRepository extends JpaRepository<UsuarioFoto, UUID> {}
