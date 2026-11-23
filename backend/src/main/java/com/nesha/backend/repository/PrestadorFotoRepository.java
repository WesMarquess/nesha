package com.nesha.backend.repository;

import com.nesha.backend.entity.PrestadorFoto;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PrestadorFotoRepository extends JpaRepository<PrestadorFoto, UUID> {}
