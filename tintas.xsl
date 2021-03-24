<?xml version="1.0" encoding="UTF-8" standalone="no" ?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
<xsl:template match="/">
  <xsl:apply-templates />
</xsl:template>

<xsl:template match="bancoTintas">
  <html>
  <head>
    <title>Banco de dados de tintas</title>
    <link rel="stylesheet" href="bancoCondutor.css" type="text/css" />
  </head>
  <body>
    <h1>Banco de dados de tintas</h1>
     	<xsl:apply-templates select="fabricante" />
    	<xsl:apply-templates select="norma" />
  </body>
  </html>
</xsl:template>

<xsl:template match="fabricante">
		<h2>Fabricante: <xsl:value-of select="@id" /></h2>
    <xsl:apply-templates select="linha" />
</xsl:template>

<xsl:template match="linha">
		<h3>Linha: <xsl:value-of select="@id" /></h3>
      <table cellpadding="1" cellspacing="1">
        <tr class="tableHeader">
          <td width="100">Id</td>
          <td width="200">Nome</td>
          <td width="50">Acab</td>
          <td width="200">RGB</td>
          <td width="200">Refs</td>
        </tr>
        <xsl:apply-templates select="tinta" />
			</table>
</xsl:template>

<xsl:template match="norma">
		<h2>Norma: <xsl:value-of select="@id" /> (<xsl:value-of select="@cod" />)</h2>
		<p>Pais: <xsl:value-of select="@pais" />, ano: <xsl:value-of select="@ano" /></p>
      <table cellpadding="1" cellspacing="1">
        <tr class="tableHeader">
          <td width="100">Id</td>
          <td width="200">Nome</td>
          <td width="50">Acab</td>
          <td width="200">RGB</td>
        </tr>
        <xsl:apply-templates select="cor" />
			</table>
</xsl:template>

<xsl:template match="tinta">
	<tr><td>
			<xsl:value-of select="@id" />
		</td><td>
			<xsl:value-of select="@nome" />
		</td><td>
			<xsl:value-of select="@acabamento" />
		</td><td bgcolor="{@hex}">
		</td><xsl:apply-templates select="ref" /><td>
	</td></tr>
</xsl:template>

<xsl:template match="ref">
	[<xsl:value-of select="@norma" /><xsl:value-of select="@fabricante" />: 
	<xsl:value-of select="@id" />] 
</xsl:template>

<xsl:template match="cor">
	<tr><td>
			<xsl:value-of select="@id" />
		</td><td>
			<xsl:value-of select="@nome" />
		</td><td>
			<xsl:value-of select="@acabamento" />
		</td><td bgcolor="{@hex}">
	</td></tr>
</xsl:template>

</xsl:stylesheet>

