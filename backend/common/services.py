from __future__ import annotations

from dataclasses import dataclass

from django.db import models


@dataclass
class ServiceResult:
    instance: models.Model
    created: bool = False
