# Public raster assets

The social preview is a 1200 × 630 composition of the official, unchanged nested-C SVG symbol, the approved palette, and public brand copy. Its editable composition is `cumulative-labs-og.source.svg`. No third-party image or font file is distributed.

The JPEG was rasterized from that SVG with Sharp 0.35.4 (JPEG quality 90, mozjpeg enabled), using system Arial. Its base64 bytes are split in order across the five existing `.b64.001` through `.b64.005` files. Normal builds reconstruct the reviewed JPEG with `npm run assets`; Sharp is not a project or production dependency. Visual re-authoring requires regenerating and reviewing the JPEG and updating those source chunks.

The existing Apple touch icon and official SVG favicon remain unchanged. Website audit evidence contains the previous and replacement social previews for independent review.
