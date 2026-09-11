param(
  [Parameter(Mandatory = $true)]
  [ValidateSet("userPromptSubmitted", "agentStop")]
  [string]$Event
)

$ErrorActionPreference = "Stop"
$payloadText = [Console]::In.ReadToEnd()
$payload = $payloadText | ConvertFrom-Json
$repoRoot = (Get-Location).Path
$logDirectory = Join-Path $repoRoot ".agent-logs"
$logPath = Join-Path $logDirectory ("session-{0}.jsonl" -f $payload.sessionId)

New-Item -ItemType Directory -Force -Path $logDirectory | Out-Null

function Write-CaptureEntry {
  param(
    [string]$Type,
    [string]$Content,
    [long]$Timestamp
  )

  if ([string]::IsNullOrEmpty($Content)) {
    return
  }

  $entry = [ordered]@{
    type = $Type
    timestamp = ([DateTimeOffset]::FromUnixTimeMilliseconds($Timestamp).UtcDateTime.ToString("o"))
    model = "Auto mode"
    content = $Content
  }
  ($entry | ConvertTo-Json -Compress) | Add-Content -Encoding UTF8 -Path $logPath
}

if ($Event -eq "userPromptSubmitted") {
  $prompt = [string]$payload.prompt
  $marker = "</branch_rename_request>"
  $markerIndex = $prompt.LastIndexOf($marker)
  if ($markerIndex -ge 0) {
    $prompt = $prompt.Substring($markerIndex + $marker.Length).Trim()
  }
  Write-CaptureEntry -Type "prompt" -Content $prompt -Timestamp ([long]$payload.timestamp)
}
else {
  $transcriptPath = [string]$payload.transcriptPath
  if (Test-Path -LiteralPath $transcriptPath) {
    $lastResponse = $null
    Get-Content -LiteralPath $transcriptPath | ForEach-Object {
      try {
        $eventRecord = $_ | ConvertFrom-Json
        if ($eventRecord.type -eq "assistant.message" -and $eventRecord.data.content) {
          $lastResponse = [string]$eventRecord.data.content
        }
        elseif ($eventRecord.type -eq "tool.execution_complete" -and
                $eventRecord.data.result.content) {
          $lastResponse = [string]$eventRecord.data.result.content
        }
      }
      catch {
        # Ignore non-JSON transcript lines; the hook must not interrupt the turn.
      }
    }
    Write-CaptureEntry -Type "response" -Content $lastResponse -Timestamp ([long]$payload.timestamp)
  }
}

Write-Output "{}"
