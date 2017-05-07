//props triggered by user interaction

export const selectedRange = (state = ['2016-01-01', '2016-12-31'], action) => {
  if (action.type === 'SET_TIMELINE_RANGE') {
    return action.range || state
  } else {
    return state
  }
}

export const isFetchingTweets = (state = false, action) => {
  if (action.type === 'SET_FETCHING_TIMELINE_TWEETS') {
    return action.value
  } else {
    return state
  }
}

export const tweets = (state = {}, action) => {
  if (action.type === 'SET_TIMELINE_TWEETS') {
    return action.data
  } else {
    return state
  }
}

export const category = (state = 'interaction', action) => {
  if (action.type === 'SET_TIMELINE_CATEGORY') {
    return action.data
  } else {
    return state
  }
}

export const matrix = (state = 'hour', action) => {
  if (action.type === 'SET_TIMELINE_MATRIX_VIEW') {
    return action.data
  } else {
    return state
  }
}