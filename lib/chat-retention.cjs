function getRetentionDays(value = process.env.CHAT_RETENTION_DAYS) {
  if (value === undefined || value === "") return 30
  if (!/^[1-9]\d*$/.test(value) || Number(value) > 365) {
    throw new Error("CHAT_RETENTION_DAYS must be an integer from 1 to 365")
  }
  return Number(value)
}

module.exports = { getRetentionDays }

