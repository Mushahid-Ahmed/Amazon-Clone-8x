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
  Write-CaptureEntry -Type "prompt" -Content ([string]$payload.prompt) -Timestamp ([long]$payload.timestamp)
}
else {
  $transcriptPath = [string]$payload.transcriptPath
  if (Test-Path -LiteralPath $transcriptPath) {
    $lastResponse = $null
    Get-Content -LiteralPath $transcriptPath | ForEach-Object {
      try {
        $eventRecord = $_ | ConvertFrom-Json
        if ($eventRecord.type -eq "assistant.message" -and
            $eventRecord.data.content -and
            (-not $eventRecord.data.toolRequests -or $eventRecord.data.toolRequests.Count -eq 0)) {
          $lastResponse = [string]$eventRecord.data.content
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
