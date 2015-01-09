<?xml version="1.0" encoding="ISO-8859-1"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

<xsl:template match="PageDisplayFormat">

	<html xmlns="http://www.w3.org/1999/xhtml" lang="en" xml:lang="en">
		<head>
			<title>eTM Edit</title>
			<!--<meta http-equiv="refresh" content="30" /> -->
			<style type="text/css">
			<!--Use the Colour definitions as defined with the data -->
			<xsl:apply-templates select="MessageHeader/PageColourDefinition/Colour" />
			</style>
		<!--	<script type="text/javascript" src="js/settings.js"></script>-->
		</head>

		<body>
<!--			<script defer="defer">
				pagefontsize = <xsl:value-of select="/PageDisplayFormat/MessageHeader/PageFontSize" />;
			</script>
			<script defer="defer">
				dataBackground = '<xsl:value-of select="/PageDisplayFormat/DataBlock/@Background" />';
			</script>
			<script defer="defer">
				dataaltBackground = '<xsl:value-of select="/PageDisplayFormat/DataBlock/@AltBackground" />';
			</script>
			<script defer="defer">
				titleBackground = '<xsl:value-of select="/PageDisplayFormat/TitleBlock/@Background" />';
			</script>
			<script defer="defer">
				pageRefreshInterval = <xsl:value-of select="/PageDisplayFormat/MessageHeader/RefreshInterval" />;
			</script>
			<script defer="defer">
				fittopage = <xsl:value-of select="/PageDisplayFormat/MessageHeader/FitToPage" />;
			</script>
			<script defer="defer">
				imezone = '<xsl:value-of select="/PageDisplayFormat/MessageHeader/Locale/@TimeType" />';
			</script>
			<script defer="defer">
				timevariance = '<xsl:value-of select="/PageDisplayFormat/MessageHeader/Locale/@Variance" />';
                        </script>
-->			
			<xsl:apply-templates select="TitleBlock" />
				
			<table id="flights" class="hovered normal">
				<thead>
					<div id="tableheader">
						<tr style="background-color:#EDEDED">
							<th id="KeyData" style="display:none"><h3>KeyData</h3></th>
							<xsl:apply-templates select="ClientTitleBlock/Row[1]/RowData" />
						</tr>
					</div>
				</thead>
				<tbody>
					<xsl:apply-templates select="DataBlock" />
				</tbody>
			</table>

			<xsl:apply-templates select="FooterBlock" />
		</body>
	</html>
	
	</xsl:template>
		<xsl:template match="MessageHeader/PageColourDefinition/Colour">
			<xsl:value-of select="concat('.',./@Name,'{color: rgb(',./@R,',',./@G,',',./@B,')}', ' ')" />
		</xsl:template>
		<xsl:template match="TitleBlock">
		<div style="width:100%;height:20px;margin:0 0 5px 0;">
			<div id="titleblock" class="titleheader" style="float:left"> 
					<xsl:attribute name="title">
						<xsl:value-of select="concat(substring-before(/PageDisplayFormat/MessageHeader/MessageCreationDateTime,'T'),' ',substring-after(/PageDisplayFormat/MessageHeader/MessageCreationDateTime,'T'))" />
					</xsl:attribute>
				<b>
					<xsl:value-of select="Row[1]/RowData" />
				</b>
			</div>
			<div  id="countdown" style="float:right;text-align:right;white-space:nowrap;width:220px">
				<font size="3" color="red"><div id="cnttxt"></div></font>
				<div id="progressBar" class="prog-default"><div></div></div>
			</div>
		</div>
	</xsl:template>

	<xsl:template match="ClientTitleBlock/Row/RowData">
		<xsl:if test="substring(@Name,1,3)!='Pad'">
			<th>
				<xsl:attribute name="id">
					<xsl:value-of select="./@Name" />
				</xsl:attribute>
				<xsl:attribute name="class">
					<xsl:value-of select="." />
					<xsl:value-of select="./@EditEnable" />
				</xsl:attribute>
			<h3>
			<xsl:attribute name="align">
                <xsl:value-of select="./@Justify" />
			</xsl:attribute>
			<xsl:attribute name="title">
				<xsl:value-of select="./@EditEnable" />
			</xsl:attribute>
	
		<xsl:value-of disable-output-escaping="yes" select=".">
		</xsl:value-of>
			</h3>
			</th>
		</xsl:if>
	</xsl:template>

	<xsl:template match="DataBlock">
		<xsl:apply-templates select="Row" />
	</xsl:template>
	
	<xsl:template match="Row">
		<tr>
			<td style='display:none'>
				<!-- <textarea> -->
				  <xsl:copy-of select="KeyData" />
				<!-- </textarea> -->
				<!--  <xsl:copy-of select="/PageDisplayFormat/MessageHeader/Locale" /> -->
			</td>
			<xsl:apply-templates select="RowData" />
		</tr>
	</xsl:template>

	<xsl:template match="RowData">
		<xsl:if test="substring(@Name,1,3)!='Pad'">
			<td>
				<xsl:variable name="poscol" select="position()" />
				<xsl:attribute name="class">
					<xsl:value-of select="./@Colour" />
				</xsl:attribute>
				<xsl:attribute name="title">
					<xsl:value-of select="./@Name" />
				</xsl:attribute>
				<xsl:attribute name="align">
					<xsl:value-of select="/PageDisplayFormat/ClientTitleBlock/Row[1]/RowData[$poscol]/@Justify" />
				</xsl:attribute>
				<xsl:value-of disable-output-escaping="yes" select="." />
			</td>
		</xsl:if>
	</xsl:template>
	
	<xsl:template match="FooterBlock">
		<table border="0" style="background-color:rgb(51, 0, 153)" id="footertable">
			<xsl:apply-templates select="Row" />
		</table>
	</xsl:template>
	
	<xsl:template match="FooterBlock/Row">
		<tr>
			<xsl:attribute name="class">
			<xsl:choose>
				<xsl:when test="position() mod 2 != 1">
					<xsl:text>footeroddrow</xsl:text>
				</xsl:when>
				<xsl:otherwise>
					<xsl:text>footerevenrow</xsl:text>
				</xsl:otherwise>
				</xsl:choose>
			</xsl:attribute>
			<!-- <td> <xsl:value-of select="position()"/> </td> -->
			<xsl:apply-templates select="RowData" />
		</tr>
	</xsl:template>

	<xsl:template match="FooterBlock/Row/RowData">
		<td >
			<xsl:variable name="poscol" select="position()" />
			<xsl:attribute name="class">
			 <xsl:value-of select="./@Colour" />
		 </xsl:attribute>
			<xsl:attribute name="title">
			 <xsl:value-of select="./@Name" />
		 </xsl:attribute>
			<xsl:value-of disable-output-escaping="yes" select="." />
		</td>
	</xsl:template>

</xsl:stylesheet>
