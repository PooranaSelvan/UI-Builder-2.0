import React from 'react'

const Button = ({className = '', style = {}, type = "button", children, ...props}) => {
  return <button className={className} style={style} {...props} type={type}>{children}</button>
}

export default Button;