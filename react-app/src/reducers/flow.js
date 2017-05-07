//props triggered by user interaction

export const selectedFriend = (state = {}, action) => {
  if (action.type === 'SET_FLOW_FRIEND') {
    return Object.assign({}, state, action.data)
  } else {
    return state;
  }
}
