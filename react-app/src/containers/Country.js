import { connect } from 'react-redux';
import CountryComponent from '../components/Country';

const mapStateToProps = (state, ownProps) => {
  const { countryList, graph } = state.data;
  const { clickedId, clicked, clickedIds } = state.graph;
  return {
    countryList,
    links: graph.links,
    ...state.country,
    clickedId,
    clicked,
    clickedIds,
  }
};

const mapDispatchToProps = (dispatch) => (
  {
    mouseOverFunc: (raceId, aName, place) => {
      dispatch({ type: 'HOVER_RACE', value: { raceId, aName, place } });
    },
    mouseOutFunc: (value) => {
      dispatch({ type: 'UNHOVER_RACE' });
    },
    clickFunc: (value, links) => {
      dispatch({ type: 'SELECT_ATHLETE', value, links });
    },
    sortCountries: (value) => {
      dispatch({ type: 'SORT_COUNTRIES', value });
    },
    sortAthletes: (value) => {
      dispatch({ type: 'SORT_ATHLETES_PER_COUNTRY', value });
    }
  }
);

const mergeProps = (stateProps, dispatchProps, ownProps) => {
  return Object.assign({}, {
    ...stateProps,
    mouseOverFunc: (raceId, aName, place) => {
      return dispatchProps.mouseOverFunc(raceId, aName, place);
    },
    mouseOutFunc: () => {
      return dispatchProps.mouseOutFunc();
    },
    clickFunc: (d) => {
      return dispatchProps.clickFunc(d, stateProps.links);
    },
    sortCountries: (e) => {
      return dispatchProps.sortCountries(e.currentTarget.value);
    },
    sortAthletes: (e) => {
      return dispatchProps.sortAthletes(e.currentTarget.value);
    },
  })
};


export default connect(mapStateToProps,
  mapDispatchToProps,
  mergeProps)(CountryComponent);