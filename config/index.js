import configProd from './prod.js'
import configDev from './dev.js'


export var config

if (process.env.NODE_ENV === 'production') {
  config = configProd
} else {
  config = configDev
}

// Guest mode lets requests with no login through as an anonymous "Guest".
// Off unless GUEST_MODE=true. The public demo logs in as a real Guest
// account instead, so it does not need this.
config.isGuestMode = process.env.GUEST_MODE === 'true'


