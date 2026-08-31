$ErrorActionPreference = 'Stop'

$base = 'D:\MarketingPilotAI\deliverables'
$docx = Join-Path $base 'ProgVision_MarketingPilotAI_Quotation.docx'
$zip = Join-Path $base 'ProgVision_MarketingPilotAI_Quotation.zip'
$tmp = Join-Path $base '_docx_tmp'

if (Test-Path $tmp) { Remove-Item $tmp -Recurse -Force }
New-Item -ItemType Directory -Force -Path $tmp, (Join-Path $tmp '_rels'), (Join-Path $tmp 'word'), (Join-Path $tmp 'word\_rels') | Out-Null

function Write-Utf8NoBom([string]$Path, [string]$Content) {
  $dir = Split-Path $Path -Parent
  if (!(Test-Path $dir)) { New-Item -ItemType Directory -Force -Path $dir | Out-Null }
  [System.IO.File]::WriteAllText($Path, $Content, [System.Text.UTF8Encoding]::new($false))
}

function Esc([string]$s) { [System.Security.SecurityElement]::Escape($s) }
function P([string]$text, [string]$style = 'Normal') { "<w:p><w:pPr><w:pStyle w:val='$style'/></w:pPr><w:r><w:t xml:space='preserve'>$(Esc $text)</w:t></w:r></w:p>" }
function Heading([string]$text, [string]$style = 'Heading1') { P $text $style }
function Cell([string]$text) { "<w:tc><w:tcPr><w:tcW w:w='2400' w:type='dxa'/></w:tcPr><w:p><w:r><w:t xml:space='preserve'>$(Esc $text)</w:t></w:r></w:p></w:tc>" }
function Row([string[]]$cells) { '<w:tr>' + (($cells | ForEach-Object { Cell $_ }) -join '') + '</w:tr>' }
function Table([string[]]$rows) { '<w:tbl><w:tblPr><w:tblW w:w="0" w:type="auto"/></w:tblPr>' + ($rows -join '') + '</w:tbl>' }

$parts = @()
$parts += P 'ProgVision' 'Title'
$parts += P 'MarketingPilot AI Technical Proposal' 'Subtitle'
$parts += P 'Version 1.0 | Confidential' 'Subtitle'
$parts += P 'Website: https://progvision.online/'
$parts += P 'Support: support@progvision.online'
$parts += P 'This document is a professional software consulting proposal and technical implementation report.'
$parts += P 'Starter budget: INR 10,000 to INR 15,000.'

$parts += Heading '1. Executive Summary'
$parts += P 'MarketingPilot AI is a centralized AI marketing and automation platform combining content creation, lead handling, CRM actions, email workflows, WhatsApp workflows, SEO support, ad assistance, and business automation.'
$parts += P 'The starter phase creates a polished and trustworthy foundation, including the visible product shell, brand presentation, core workflows, and the infrastructure needed to prove the concept.'
$parts += Table @(
  (Row @('Item','Summary')),
  (Row @('Project overview','All-in-one SaaS for marketing operations, lead nurturing, and AI-assisted execution.')),
  (Row @('Objectives','Launch a credible starter release, validate the platform, and prepare for scale.')),
  (Row @('Scope','Landing page, login, admin shell, lead import, template library, integrations, and starter AI workflows.')),
  (Row @('Deliverables','Technical report, system architecture, infrastructure plan, cost sheet, timeline, and launch assumptions.'))
)

$parts += Heading '2. Technology Stack'
$parts += Table @(
  (Row @('Layer','Technology','Purpose','Why selected')),
  (Row @('Frontend','Next.js 15 / React 19 / TypeScript 5 / Tailwind CSS 4 / shadcn/ui / Framer Motion','Server-rendered UI, routing, dashboard screens, and interactions','Modern, fast, SEO-friendly, and suitable for enterprise-grade web apps')),
  (Row @('Backend','Node.js runtime / FastAPI or Express / REST API / background workers','Business logic, request handling, workflows, queues, and async jobs','Flexible enough for API-first SaaS development and automation')),
  (Row @('Database & Auth','PocketBase / authentication layer / file storage','User accounts, session handling, records, and uploads','Lightweight for the starter phase and easy to operate at low cost')),
  (Row @('AI & Automation','Vercel AI SDK / OpenRouter free models / DeepSeek-R1 / Qwen / Llama 3.1 / RAG engine','Inference, content generation, business analysis, and knowledge retrieval','Supports low-cost AI usage while keeping provider flexibility')),
  (Row @('Cloud & Deployment','Ubuntu 24.04 LTS / Nginx / Cloudflare / Let''s Encrypt / GitHub Actions / PM2','Server hosting, reverse proxy, SSL, CI/CD, and process management','Stable, standard, and widely used for production SaaS deployments')),
  (Row @('Email & Integrations','Zoho Mail / SMTP / WhatsApp API / Meta Ads / Google Ads / Webhooks','Invites, alerts, campaign delivery, and external system connections','Necessary for real client communication and operational automation'))
)

$parts += Heading '3. System Architecture'
$parts += P 'Client -> Frontend -> Backend -> Database. AI services, email, WhatsApp, and ads connect through dedicated integration layers and deployment runs on VPS with SSL, monitoring, and backups.'

$parts += Heading '4. Development Scope'
$parts += Table @(
  (Row @('Module','Features','Deliverables','Effort')),
  (Row @('Landing page','Hero, positioning, CTA, trust signals','Public marketing entry point','Low')),
  (Row @('Login and admin','Auth screens, role control, session handling','Secure access shell','Low')),
  (Row @('Lead import','CSV, Excel, manual rows, validation','Lead intake interface','Medium')),
  (Row @('CRM and workflow','Lead status, follow-up, tasks, notes','Starter CRM layer','Medium')),
  (Row @('Templates','Centralized email and WhatsApp templates','Message library + preview','Medium')),
  (Row @('AI modules','Content, SEO, ads, scripts, suggestions','AI-assisted workbench','Medium')),
  (Row @('Integrations','SMTP, WhatsApp, Meta, Google, webhooks','Integration setup pages','High'))
)

$parts += Heading '5. Infrastructure & Deployment'
$parts += Table @(
  (Row @('Area','Plan','Notes')),
  (Row @('Hosting','Small VPS or cloud VM','App server, API, and runtime services in one controlled environment.')),
  (Row @('VPS specification','2 vCPU / 4 GB RAM to start','Enough for a lean starter release; upgrade if traffic grows.')),
  (Row @('Domain and SSL','Custom domain + Cloudflare / Let''s Encrypt SSL','Required for trust, security, and production use.')),
  (Row @('Database','PocketBase starter database','Simple to deploy now; can later move to PostgreSQL if needed.')),
  (Row @('Backup strategy','Automated daily backup job','Keep database, uploads, and config backups off-server.')),
  (Row @('CI/CD pipeline','Manual first, automated later','Git-based deploy flow can be added after the pilot stage.')),
  (Row @('Monitoring','Logs + uptime alerts','Track app health, mail failures, and API issues.')),
  (Row @('Security','HTTPS, access control, secrets management, rate limiting','Basic production safeguards for a public SaaS launch.'))
)

$parts += Heading '6. Third-Party Services'
$parts += Table @(
  (Row @('Service','Purpose','Free / Paid','Monthly cost','Required?')),
  (Row @('PocketBase','Starter database, auth, and file storage','Free','INR 0','Yes')),
  (Row @('OpenRouter','Free AI model access for generation','Free tier','INR 0 - INR 2,000','Yes')),
  (Row @('Zoho Mail / SMTP','Business email, invitations, alerts','Paid or bundled','INR 500 - INR 2,000','Yes')),
  (Row @('Cloudflare','DNS, SSL, caching, protection','Free / Paid','INR 0 - INR 1,500','Recommended')),
  (Row @('VPS Hosting','Runs frontend, backend, and services','Paid','INR 1,500 - INR 5,000','Yes')),
  (Row @('Domain','Public site and app identity','Paid','INR 80 - INR 200 monthly equivalent','Yes')),
  (Row @('Monitoring tools','Uptime and log review','Free / Paid','INR 500 - INR 2,000','Recommended'))
)

$parts += Heading '7. Development Cost'
$parts += Table @(
  (Row @('Area','Estimated cost')),
  (Row @('UI/UX','INR 2,000 - INR 3,000')),
  (Row @('Backend','INR 2,000 - INR 3,000')),
  (Row @('AI Engine','INR 1,500 - INR 2,500')),
  (Row @('CRM','INR 1,000 - INR 2,000')),
  (Row @('Automation','INR 1,500 - INR 2,500')),
  (Row @('Testing','INR 1,000 - INR 1,500')),
  (Row @('Deployment','INR 1,000 - INR 1,500')),
  (Row @('Documentation','INR 500 - INR 1,000'))
)
$parts += P 'Starter development budget: INR 10,000 - INR 15,000.'

$parts += Heading '8. Post-Launch Running Cost'
$parts += Table @(
  (Row @('Cost item','Expected monthly cost','Comment')),
  (Row @('Hosting','INR 1,500 - INR 5,000','Server, app runtime, and storage.')),
  (Row @('Database','INR 0 - INR 2,000','PocketBase starter or managed DB later.')),
  (Row @('AI usage','INR 0 - INR 2,000','Free model usage plus growth margin.')),
  (Row @('Email service','INR 500 - INR 2,000','SMTP or Zoho Mail for production mail.')),
  (Row @('Domain renewal','INR 80 - INR 200 monthly equivalent','Annual renewal averaged monthly.')),
  (Row @('Monitoring and backup','INR 500 - INR 2,000','Logs, uptime checks, backups, alerts.')),
  (Row @('Maintenance','INR 1,000 - INR 3,000','Bug fixes, support, and minor updates.'))
)

$parts += Heading '9. Deployment Process'
$parts += Table @(
  (Row @('Phase','Description')),
  (Row @('Phase 1','Develop the UI, backend, and core workflows locally.')),
  (Row @('Phase 2','Connect database, email, AI, and integration services.')),
  (Row @('Phase 3','Deploy to VPS, enable SSL, configure domain and DNS.')),
  (Row @('Phase 4','Run testing, monitoring, backups, and production checks.'))
)

$parts += Heading '10. Maintenance & Support'
$parts += Table @(
  (Row @('Plan','Coverage','Typical monthly cost')),
  (Row @('Basic support','Bug fixes, small updates, and health checks','INR 1,000 - INR 3,000')),
  (Row @('Standard support','Monitoring, backups, fixes, and feature touch-ups','INR 3,000 - INR 7,000')),
  (Row @('AMC / growth support','Ongoing enhancements, new modules, and operational follow-up','Custom'))
)

$parts += Heading '11. Timeline'
$parts += Table @(
  (Row @('Phase','Duration','Outcome')),
  (Row @('Phase 1','2 - 3 days','Scope, branding, layout, and technical planning')),
  (Row @('Phase 2','4 - 6 days','UI, login, dashboard, lead import, and template shells')),
  (Row @('Phase 3','3 - 5 days','Integrations, AI wiring, deployment, and tests')),
  (Row @('Phase 4','1 - 2 days','Polish, handover, and report finalization'))
)

$parts += Heading '12. Assumptions & Exclusions'
$parts += Table @(
  (Row @('Included','Optional / not included yet')),
  (Row @('Starter SaaS shell, base workflows, infrastructure planning, technical report, and launch-ready presentation.','High-scale AI usage, advanced WhatsApp automation, heavy paid ads integration, large production infrastructure, and custom enterprise SLAs.'))
)

$parts += Heading '13. Conclusion'
$parts += P 'MarketingPilot AI can be launched as a polished starter product within a lean budget if the first release stays focused on the core user journey and the infrastructure remains intentionally lightweight.'
$parts += P 'This report gives a client or investor clear visibility into the architecture, technology stack, deployment path, operational cost, and growth roadmap.'

$docXml = @"
<?xml version='1.0' encoding='UTF-8' standalone='yes'?>
<w:document xmlns:w='http://schemas.openxmlformats.org/wordprocessingml/2006/main'>
  <w:body>
    $($parts -join "`n")
    <w:sectPr>
      <w:pgSz w:w='11906' w:h='16838'/>
      <w:pgMar w:top='1440' w:right='1134' w:bottom='1134' w:left='1134' w:header='708' w:footer='708' w:gutter='0'/>
    </w:sectPr>
  </w:body>
</w:document>
"@

$stylesXml = @"
<?xml version='1.0' encoding='UTF-8' standalone='yes'?>
<w:styles xmlns:w='http://schemas.openxmlformats.org/wordprocessingml/2006/main'>
  <w:style w:type='paragraph' w:default='1' w:styleId='Normal'><w:name w:val='Normal'/></w:style>
  <w:style w:type='paragraph' w:styleId='Title'><w:name w:val='Title'/><w:rPr><w:b/><w:sz w:val='40'/><w:color w:val='17385F'/></w:rPr></w:style>
  <w:style w:type='paragraph' w:styleId='Subtitle'><w:name w:val='Subtitle'/><w:rPr><w:sz w:val='22'/><w:color w:val='5B6472'/></w:rPr></w:style>
  <w:style w:type='paragraph' w:styleId='Heading1'><w:name w:val='heading 1'/><w:rPr><w:b/><w:sz w:val='28'/><w:color w:val='1E40AF'/></w:rPr></w:style>
</w:styles>
"@

$contentTypes = @"
<?xml version='1.0' encoding='UTF-8' standalone='yes'?>
<Types xmlns='http://schemas.openxmlformats.org/package/2006/content-types'>
  <Default Extension='rels' ContentType='application/vnd.openxmlformats-package.relationships+xml'/>
  <Default Extension='xml' ContentType='application/xml'/>
  <Override PartName='/word/document.xml' ContentType='application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml'/>
  <Override PartName='/word/styles.xml' ContentType='application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml'/>
</Types>
"@

$rels = @"
<?xml version='1.0' encoding='UTF-8' standalone='yes'?>
<Relationships xmlns='http://schemas.openxmlformats.org/package/2006/relationships'>
  <Relationship Id='rId1' Type='http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument' Target='word/document.xml'/>
</Relationships>
"@

$docRels = @"
<?xml version='1.0' encoding='UTF-8' standalone='yes'?>
<Relationships xmlns='http://schemas.openxmlformats.org/package/2006/relationships'></Relationships>
"@

Write-Utf8NoBom (Join-Path $tmp '[Content_Types].xml') $contentTypes
Write-Utf8NoBom (Join-Path $tmp '_rels\.rels') $rels
Write-Utf8NoBom (Join-Path $tmp 'word\document.xml') $docXml
Write-Utf8NoBom (Join-Path $tmp 'word\styles.xml') $stylesXml
Write-Utf8NoBom (Join-Path $tmp 'word\_rels\document.xml.rels') $docRels

if (Test-Path $zip) { Remove-Item $zip -Force }
if (Test-Path $docx) { Remove-Item $docx -Force }
Compress-Archive -Path (Join-Path $tmp '*') -DestinationPath $zip -Force
Rename-Item -Path $zip -NewName (Split-Path $docx -Leaf)
Remove-Item $tmp -Recurse -Force
Get-Item $docx | Select-Object FullName,Length,LastWriteTime | Format-List
