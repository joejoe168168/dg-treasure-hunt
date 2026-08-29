# DG Treasure Hunt asset pipeline

This is the required convention for production waterfront and city assets.

## File names and layout

```text
public/assets/landmarks/<landmark>/<landmark>-<lod>.glb
public/assets/textures/<material>/<material>-<channel>-<size>.<webp|jpg|png>
```

Use lowercase kebab-case. LOD suffixes are `high`, `medium`, and `low`. Collision
nodes use the suffix `-collision` and are excluded from rendering.

## GLB coordinate convention

- Metres, Y-up, +Z toward the model's main entrance.
- Apply transforms before export; model origin sits at pavement level.
- One recognisable landmark per GLB. Reusable street furniture may share a file.
- Prefer instancing-compatible meshes for lamps, benches, planters, trees and signs.
- Name entrance anchors `anchor-entrance` and chest anchors `anchor-chest`.

## Materials and textures

- Base colour and emissive maps use sRGB; normal, roughness and metalness are linear.
- Glass uses controlled transparency and low roughness; stone/brick use high roughness;
  painted metal uses medium roughness and restrained metalness.
- High: up to 2048 px for landmark hero surfaces. Medium: 1024 px. Low/mobile: 512 px.
- Prefer WebP/JPEG for opaque colour maps and PNG only when alpha is required.
- Night identity belongs in emissive maps/materials, not duplicated geometry.

## Geometry, collision and LOD budgets

| Level | Intended view | Triangle guideline |
| --- | --- | ---: |
| High | close promotional view | 80k per hero landmark |
| Medium | normal desktop gameplay | 30k per landmark |
| Low | mobile/distant view | 8k per landmark |

Collision meshes must be simple boxes/convex hulls and must never block a chest,
entrance, pavement route or zebra crossing. Switch LOD by distance and device quality;
do not merely hide the entire landmark on mobile.

Current measured whole-scene budgets are 1,000 desktop draw calls, 1,050 mobile
draw calls, 1,000 geometries, 80 textures and at least 30/24 FPS respectively.
These are regression ceilings for the existing procedural city, not aspirational
targets: new GLB/LOD work should reduce draw calls while staying below every ceiling.

## Acceptance checklist

- Recognisable without signage and correctly scaled against the schoolgirl.
- Entrance faces the correct road; chest anchor is reachable from a pavement.
- Morning and night materials remain readable.
- No flickering coplanar surfaces or shadow acne in inspection screenshots.
- High/medium/low variants keep the same origin and anchor names.
- All assets load through `js/app/asset-manager.js` so progress and failures are visible.
