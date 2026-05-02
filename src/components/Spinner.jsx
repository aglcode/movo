import React from 'react'
import { IconLoader2 } from '@tabler/icons-react'

const Spinner = () => {
  return (
    <div className="flex items-center justify-center py-12" role="status">
      <IconLoader2 className="size-8 text-primary animate-spin" />
      <span className="sr-only">Loading...</span>
    </div>
  )
}

export default Spinner