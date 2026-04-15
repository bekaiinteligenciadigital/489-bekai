onRecordAfterCreateSuccess((e) => {
  const axis = e.record.get('axis')
  const title = e.record.get('title')

  if (!axis) {
    e.next()
    return
  }

  try {
    const professionals = $app.findRecordsByFilter(
      'Nascimento',
      "role = 'professional'",
      '-created',
      1000,
      0,
    )

    let notifiedCount = 0
    for (const prof of professionals) {
      const specialty = prof.get('specialty')
      const interestsStr = prof.get('notifiable_interests')

      let interests = []
      try {
        if (typeof interestsStr === 'string' && interestsStr !== '') {
          interests = JSON.parse(interestsStr)
        } else if (Array.isArray(interestsStr)) {
          interests = interestsStr
        }
      } catch (err) {}

      if (specialty === axis || (interests && interests.includes(axis))) {
        // Log event / Simulate notification dispatch to professional interested in this axis
        console.log(
          `[Notification Dispatch] To: ${prof.get('email')} - New study published in your interest axis (${axis}): ${title}`,
        )
        notifiedCount++
      }
    }
    console.log(`Sent notifications to ${notifiedCount} professionals for new study in ${axis}.`)
  } catch (err) {
    console.log('Error finding professionals for notification:', err)
  }

  e.next()
}, 'scientific_library')
