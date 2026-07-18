<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:s="http://www.sitemaps.org/schemas/sitemap/0.9">
  <xsl:output method="html" encoding="UTF-8" indent="yes"/>

  <xsl:template match="/">
    <html lang="en">
      <head>
        <meta charset="UTF-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <title>ENSmenu Sitemap</title>
        <style>
          body { font-family: system-ui, sans-serif; margin: 24px; color: #1e293b; }
          h1 { font-size: 1.25rem; margin-bottom: 8px; }
          p.note { color: #64748b; font-size: 0.875rem; margin-bottom: 20px; }
          table { border-collapse: collapse; width: 100%; font-size: 0.875rem; }
          th, td { border: 1px solid #e2e8f0; padding: 8px 10px; text-align: left; }
          th { background: #f8fafc; }
          tr:nth-child(even) { background: #f8fafc; }
          a { color: #0d9488; word-break: break-all; }
        </style>
      </head>
      <body>
        <xsl:apply-templates/>
      </body>
    </html>
  </xsl:template>

  <xsl:template match="s:urlset">
    <h1>XML Sitemap (URLs)</h1>
    <p class="note">For search engines only. Browsers use this preview; Google reads the raw XML.</p>
    <table>
      <tr>
        <th>URL</th>
        <th>Last modified</th>
        <th>Change freq.</th>
        <th>Priority</th>
      </tr>
      <xsl:for-each select="s:url">
        <tr>
          <td><a href="{s:loc}"><xsl:value-of select="s:loc"/></a></td>
          <td><xsl:value-of select="s:lastmod"/></td>
          <td><xsl:value-of select="s:changefreq"/></td>
          <td><xsl:value-of select="s:priority"/></td>
        </tr>
      </xsl:for-each>
    </table>
    <p class="note"><xsl:value-of select="count(s:url)"/> URL(s)</p>
  </xsl:template>

  <xsl:template match="s:sitemapindex">
    <h1>XML Sitemap Index</h1>
    <p class="note">Child sitemap files referenced by this index.</p>
    <table>
      <tr>
        <th>Sitemap URL</th>
        <th>Last modified</th>
      </tr>
      <xsl:for-each select="s:sitemap">
        <tr>
          <td><a href="{s:loc}"><xsl:value-of select="s:loc"/></a></td>
          <td><xsl:value-of select="s:lastmod"/></td>
        </tr>
      </xsl:for-each>
    </table>
    <p class="note"><xsl:value-of select="count(s:sitemap)"/> child sitemap(s)</p>
  </xsl:template>
</xsl:stylesheet>
