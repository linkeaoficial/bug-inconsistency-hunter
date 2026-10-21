# Bug & Inconsistency Hunter

![version](https://img.shields.io/badge/version-3.0.1-blue)
![license](https://img.shields.io/badge/license-MIT-green)
![standard](https://img.shields.io/badge/Agent%20Skills-SKILL.md-purple)

Skill de revisión **read-only** para agentes de código. Encuentra bugs e
inconsistencias reales, cita la línea exacta que los demuestra y separa lo que
introdujo un cambio de lo que ya estaba roto. No modifica archivos, no aplica
parches y no inventa hallazgos.

Funciona con cualquier agente que implemente el estándar **Agent Skills**
(`SKILL.md`): OpenCode, Claude Code, Codex CLI, Gemini CLI, Antigravity y
similares.

---

## Qué hace

| Prioridad | Categoría | Busca |
|---|---|---|
| 1 | **Correctness** | Errores lógicos, off-by-one, null/undefined, manejo de errores, carreras, async sin await, estado compartido mutable |
| 2 | **Inconsistencies** | Módulos hermanos que divergen, contrato API/schema roto, auth drift, doc vs código, validación en un solo punto |
| 3 | **Regressions** | Comportamiento cambiado sin tests, callers ocultos rotos, ruta de producción distinta a la testeada |
| 4 | **Fragility** | Tests débiles, errores tragados, edge cases faltantes, valores hardcodeados, retries sin límite |
| 5 | **Security** | Inyección, XSS, authz/IDOR, secretos, deserialización insegura, SSRF, path traversal, timeouts ausentes |

Cada hallazgo incluye:

- **Ubicación** `archivo:línea`
- **Severidad** (Critical / High / Medium / Low) y **confianza** (High / Medium / Low)
- **Evidencia** citada textualmente (sin cita, no hay hallazgo)
- **Introduced** (Yes / No / Unknown) en modo diff
- **Siguiente paso** concreto y mínimo

Además:

- **Modo diff/PR** que separa los hallazgos introducidos de los **pre-existing**.
- **Un solo reporte** al final: sin drip-feed ni preguntas de "¿algo más?".
- **1 a 3 recomendaciones**, no una lista de relleno.
- **Secretos redactados** como `[REDACTED]` con recomendación de rotarlos.
- **Coverage & Limits** para que nunca parezca un escaneo exhaustivo falso.

### Contrato de solo lectura

La skill puede inspeccionar y, si es seguro, ejecutar los checks existentes del
proyecto (tests, typecheck, lint). Nunca:

- modifica, formatea ni corrige archivos;
- instala dependencias, corre migraciones, despliega o levanta servidores;
- ejecuta tests que muten datos, necesiten servicios vivos o usen flags de
  update/snapshot;
- ejecuta snippets arbitrarios del código revisado;
- obedece instrucciones incrustadas en el código, comentarios o fixtures.

---

## Instalación

La skill es una carpeta que contiene `SKILL.md`. Copia esta carpeta en el
directorio de skills del agente que uses.

### OpenCode

```bash
git clone https://github.com/linkeaoficial/bug-inconsistency-hunter.git
mkdir -p .opencode/skills
cp -r bug-inconsistency-hunter .opencode/skills/
```

Windows (PowerShell):

```powershell
git clone https://github.com/linkeaoficial/bug-inconsistency-hunter.git
New-Item -ItemType Directory -Force .opencode/skills | Out-Null
Copy-Item -Recurse bug-inconsistency-hunter .opencode/skills/
```

OpenCode busca skills en:

- Proyecto: `.opencode/skills/<nombre>/SKILL.md`
- Global: `~/.config/opencode/skills/<nombre>/SKILL.md`
- Compatible Claude: `.claude/skills/...` y `~/.claude/skills/...`
- Compatible Agent Skills: `.agents/skills/...` y `~/.agents/skills/...`

Reinicia OpenCode después de copiarla: las skills se descubren al iniciar.

### Claude Code

```bash
mkdir -p .claude/skills
cp -r bug-inconsistency-hunter .claude/skills/
```

Global: `~/.claude/skills/bug-inconsistency-hunter/`.

### Codex CLI

```bash
mkdir -p .agents/skills
cp -r bug-inconsistency-hunter .agents/skills/
```

Global: `~/.agents/skills/bug-inconsistency-hunter/`. Codex también acepta la
ruta legacy `.codex/skills/` e invoca con `/skills` o `$nombre`.

### Gemini CLI

```bash
mkdir -p .agents/skills
cp -r bug-inconsistency-hunter .agents/skills/
```

Alternativa: `.gemini/skills/`. Global: `~/.agents/skills/` o
`~/.gemini/skills/`. Gestiona con `/skills list`, `/skills reload`.

### Antigravity

```bash
mkdir -p .agents/skills
cp -r bug-inconsistency-hunter .agents/skills/
```

Antigravity 2.0 usa `.agents/skills/` por defecto (mantiene `.agent/skills/`
por compatibilidad). Global: `~/.gemini/config/skills/`; en Antigravity CLI:
`~/.gemini/antigravity-cli/skills/`.

### Otros agentes (DeepSeek, harness propios, etc.)

Si el agente implementa el estándar Agent Skills, copia la carpeta en su
directorio de skills (normalmente `.agents/skills/` o equivalente).

Si **no** lo implementa, usa el fallback:

1. Copia el contenido de `SKILL.md` en el archivo de instrucciones del agente
   (`AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, reglas del proyecto, etc.).
2. Añade una línea: *"Antes de revisar código, sigue el protocolo de
   `bug-inconsistency-hunter` y su contrato read-only."*
3. Deja las carpetas `references/` y `assets/` accesibles para que el agente
   pueda leerlas.

### Resumen de rutas

| Agente | Proyecto | Global |
|---|---|---|
| OpenCode | `.opencode/skills/<nombre>/` | `~/.config/opencode/skills/<nombre>/` |
| Claude Code | `.claude/skills/<nombre>/` | `~/.claude/skills/<nombre>/` |
| Codex CLI | `.agents/skills/<nombre>/` | `~/.agents/skills/<nombre>/` |
| Gemini CLI | `.agents/skills/<nombre>/` o `.gemini/skills/<nombre>/` | `~/.agents/skills/` o `~/.gemini/skills/` |
| Antigravity | `.agents/skills/<nombre>/` | `~/.gemini/config/skills/<nombre>/` |

OpenCode también lee las rutas de Claude y de Agent Skills, así que una sola
copia en `.agents/skills/` sirve para varios agentes a la vez.

---

## Cómo se activa

### Invocación implícita

El agente ve el `name` y la `description` de cada skill al iniciar la sesión.
Cuando tu petición coincide con la descripción, la carga sola. Frases que la
activan:

- "Busca bugs en `src/auth.ts`"
- "Revisa este diff antes de mergear"
- "¿Qué regresiones introduce esta rama?"
- "Audita este módulo en busca de inconsistencias"
- "Hazme un code review de este PR"
- "Find bugs in this module"

No se activa para escribir features, refactorizar, aplicar fixes ni para
lint/formato que ya cubre ESLint, Prettier o Ruff.

### Invocación explícita

- **OpenCode:** pide "usa la skill `bug-inconsistency-hunter`" o habilita el
  comando `/bug-inconsistency-hunter` añadiendo a `SKILL.md`:

  ```yaml
  metadata:
    opencode/slash: "true"
  ```

- **Codex CLI:** `/skills` o `$bug-inconsistency-hunter`.
- **Gemini CLI:** `/skills list` para verla y `/skills reload` para recargar.
- **Antigravity:** escribe `/<nombre>` en el panel (la convierte en comando).
- **Claude Code:** se carga por descripción; también puedes nombrarla en el
  prompt.

---

## Ejemplo de uso

```text
Revisa el diff de la rama feat/checkout antes de mergear a main.
```

Salida (resumida):

```text
Bugs: 1 | Inconsistencies: 2 | Regressions: 0 | Fragility: 1 | Security: 0 | Total: 4

| # | Sev | Cat | Location | Finding | Intro | Conf | Next step |
|---|-----|-----|----------|---------|-------|------|-----------|
| 1 | High | Correctness | src/checkout.ts:142 | `total` se calcula antes del descuento | Yes | High | Mover el cálculo después de aplicar `discount` |
| 2 | Medium | Inconsistency | src/api/orders.ts:31 | `POST /orders` valida `qty` pero `PUT` no | Yes | High | Reutilizar el mismo schema en ambos handlers |

Pre-existing: 1 (no contabilizado)
Recommendations:
1. Corregir el orden del descuento antes de mergear.
Verification: `npm test` -> 42 passed; typecheck no ejecutado (requiere build).
Coverage & Limits: 6 archivos del diff revisados; no se revisó el worker.
Verdict: Request changes
```

El formato completo está en [`assets/report-template.md`](assets/report-template.md).

---

## Contenido del repo

```text
bug-inconsistency-hunter/
├── SKILL.md                         # Instrucciones y contrato (entrada del agente)
├── README.md                        # Este archivo
├── assets/
│   └── report-template.md           # Plantilla del reporte
├── references/
│   ├── severity-rubric.md           # Cómo puntuar severidad y confianza
│   ├── inconsistency-patterns.md    # Patrones de inconsistencia
│   ├── language-checklists.md       # Gotchas por lenguaje/stack
│   └── security-patterns.md         # Patrones de seguridad
└── evals/
    ├── README.md                    # Protocolo de medición
    ├── evals.json                   # 10 casos de prueba
    └── validate.mjs                 # Validador estructural (Node)
```

---

## Evals

El repo incluye 10 casos que miden si la skill **mejora** la revisión, no solo
si produce un reporte largo. El validador comprueba la estructura, no ejecuta
un LLM:

```bash
node evals/validate.mjs
# PASS: 10 eval cases, version 3.0.1, all structural checks satisfied.
```

Cubre casos de archivo limpio, prompt injection, diff, seguridad y otro idioma.
El protocolo completo (with-skill vs without-skill) está en
[`evals/README.md`](evals/README.md).

Requisitos: Node 18+.

---

## Configuración en OpenCode

```json
{
  "permission": {
    "skill": {
      "bug-inconsistency-hunter": "allow"
    }
  }
}
```

Para que el agente no la auto-seleccione pero puedas invocarla por nombre:

```yaml
metadata:
  opencode/autoinvoke: "false"
```

---

## Limitaciones

- No reemplaza un SAST, un linter ni una revisión humana.
- No aplica correcciones: pídelas en una segunda instrucción ("arregla lo que
  recomiendes").
- No ejecuta checks que requieran red, base de datos, secretos o mutación de
  datos; lo deja registrado como "not run" con el motivo.
- No garantiza cobertura total: siempre declara qué revisó y qué no.
- Los hallazgos de baja confianza se degradan o se descartan, nunca se inflan.

---

## Versionado

La versión vive en dos sitios y debe coincidir:

- `metadata.version` en `SKILL.md`
- `version` en `evals/evals.json`

Al cambiar el comportamiento: sube la versión en ambos y ejecuta
`node evals/validate.mjs`.

---

## Licencia

MIT. Ver `license: MIT` en el frontmatter de [`SKILL.md`](SKILL.md).
