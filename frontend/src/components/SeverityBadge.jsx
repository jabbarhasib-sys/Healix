export default function SeverityBadge({ level = 'routine', label }) {
  const config = {
    emergency: { cls: 'badge-critical', text: label || 'Critical Severity' },
    critical:  { cls: 'badge-critical', text: label || 'Critical Severity' },
    urgent:    { cls: 'badge-urgent',   text: label || 'Urgent' },
    routine:   { cls: 'badge-routine',  text: label || 'Routine' },
  }
  const normLevel = (level || 'routine').toLowerCase()
  const { cls, text } = config[normLevel] || config.routine
  return <span className={cls}>{text}</span>
}
