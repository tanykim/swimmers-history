import AppReducer from './index';
import deepFreeze from 'deep-freeze';

describe('Reducer', ()=>{
    it('Initialize action', ()=>{
        const state = {};
        const action = { type: 'INITIALIZE' };
        const expected = { data: false, intro: false, vis: false };
        deepFreeze(state);
        deepFreeze(action);
        deepFreeze(expected);

        const res = AppReducer(state, action);
        expect(res.isLoading).toEqual(expected);
    });

    it('Set gender action', ()=>{
        const state = {};
        const action = {
            type: 'SET_GENDER',
            value: 'men'
        };
        deepFreeze(state);
        deepFreeze(action);
        const res = AppReducer(state, action);
        expect(res.gender.type).toEqual('men');
    });

    it('Set view change action', ()=>{
        const state = {
            isLoading: { data: false, intro: true, vis: false }
        };
        const action = { type: 'SET_VIEW_CHANGE', from: 'intro', to: 'vis'};
        const expected = { data: false, intro: false, vis: true };
        deepFreeze(state);
        deepFreeze(action);
        deepFreeze(expected);
        const res = AppReducer(state, action);
        expect(res.isLoading).toEqual(expected);
    });
});