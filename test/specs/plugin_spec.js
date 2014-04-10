
describe('Common features', function () {
    'use strict';
    
    var serviceUrl = '/some/url';

    beforeEach(function(){
        this.input = document.createElement('input');
        this.$input = $(this.input).appendTo('body');
        this.instance = this.$input.suggestions({
            serviceUrl: serviceUrl
        }).suggestions();
        
        this.server = sinon.fakeServer.create();
    });
    
    afterEach(function () {
        this.instance.dispose();
        this.$input.remove();
        this.server.restore();
    });

    it('Should initialize suggestions options', function () {
        expect(this.instance.options.serviceUrl).toEqual(serviceUrl);
    });

    it('Should create all additional components', function(){
        var instance = this.instance;
        $.each(['$wrapper','$container','$preloader','$constraints'], function(i,component){
            expect(instance[component].length).toEqual(1);
        });
    });

    it('Should get current value', function () {
        this.input.value = 'Jam';
        this.instance.onValueChange();

        this.server.respond(serviceUrl, helpers.responseFor([{ value: 'Jamaica', data: 'B' }]));

        expect(this.instance.visible).toBe(true);
        expect(this.instance.currentValue).toEqual('Jam');
    });

    it('Verify onSelect callback', function () {
        var suggestions = [{ value: 'A', data: 'B' }],
            options = {
                onSelect: function(){}
            };
        spyOn(options, 'onSelect');
        
        this.instance.setOptions(options);
        this.input.value = 'A';
        this.instance.onValueChange();
        this.server.respond(serviceUrl, helpers.responseFor(suggestions));
        this.instance.select(0);

        expect(options.onSelect.calls.count()).toEqual(1);
        expect(options.onSelect).toHaveBeenCalledWith(suggestions[0]);
    });

    it('Should convert suggestions format', function () {
        this.input.value = 'A';
        this.instance.onValueChange();
        this.server.respond(serviceUrl, helpers.responseFor(['Alex','Ammy','Anny']));
        expect(this.instance.suggestions[0]).toEqual({value:'Alex', data:null});
        expect(this.instance.suggestions[1]).toEqual({value:'Ammy', data:null});
        expect(this.instance.suggestions[2]).toEqual({value:'Anny', data:null});
    });

    it('Should use custom query parameter name', function () {
        this.instance.setOptions({
            paramName: 'custom'
        });

        this.input.value = 'Jam';
        this.instance.onValueChange();

        expect(this.server.requests[0].requestBody).toContain('"custom":"Jam"');
    });

    it('Should destroy suggestions instance', function () {
        var $div = $(document.createElement('div'));

        $div.append(this.input);
        
        expect(this.$input.data('suggestions')).toBeDefined();

        this.$input.suggestions('dispose');

        expect(this.$input.data('suggestions')).toBeUndefined();
        $.each(['.suggestions-suggestions','.suggestions-preloader','.suggestions-constraints'], function(i, selector){
            expect($div.find(selector).length).toEqual(0);
        });
    });

    it('Should construct serviceUrl via callback function.', function () {
        this.instance.setOptions({
            ignoreParams: true,
            serviceUrl: function (query) {
                return '/dynamic-url/' + (query && encodeURIComponent(query).replace(/%20/g, "+") || '');
            }
        });

        this.input.value = 'Hello World';
        this.instance.onValueChange();

        expect(this.server.requests[0].url).toBe('/dynamic-url/Hello+World');
    });

    it('Should set width to be greater than zero', function () {
        this.input.value = 'Jam';
        this.instance.onValueChange();
        this.server.respond(serviceUrl, helpers.responseFor([{ value: 'Jamaica', data: 'B' }]));
        expect(this.instance.$container.width()).toBeGreaterThan(0);
    });

    it('Should call beforeRender and pass container jQuery object', function () {
        var options = {
            beforeRender: function () {}
        };
        spyOn(options, 'beforeRender');
        this.instance.setOptions(options);

        this.input.value = 'Jam';
        this.instance.onValueChange();
        this.server.respond(serviceUrl, helpers.responseFor([{ value: 'Jamaica', data: 'B' }]));

        expect(options.beforeRender.calls.count()).toEqual(1);
        expect(options.beforeRender).toHaveBeenCalledWith(this.instance.$container);
    });

    it('Should prevent Ajax requests if previous query with matching root failed.', function () {

        this.instance.setOptions({ preventBadQueries: true });
        this.input.value = 'Jam';
        this.instance.onValueChange();

        expect(this.server.requests.length).toEqual(1);
        this.server.respond(serviceUrl, helpers.responseFor([]));

        this.input.value = 'Jama';
        this.instance.onValueChange();
        
        expect(this.server.requests.length).toEqual(1);

        this.input.value = 'Jamai';
        this.instance.onValueChange();
        
        expect(this.server.requests.length).toEqual(1);
    });

    it('Should highlight search phrase', function () {
        this.input.value = 'japa';
        this.instance.onValueChange();

        this.server.respond(serviceUrl, helpers.responseFor(['Japaneese lives in Japan and love non-japaneese']));

        var $item = this.instance.$container.children('.suggestions-suggestion');
            
        expect($item.length).toEqual(1);
        expect($item.html()).toEqual('<strong>Japa<\/strong>neese lives in <strong>Japa<\/strong>n and love non-japaneese');
    });
    
    it('Should display default hint message above suggestions', function(){
        this.input.value = 'jam';
        this.instance.onValueChange();
        this.server.respond(serviceUrl, helpers.responseFor(['Jamaica']));

        var $hint = this.instance.$container.find('.suggestions-hint');
            
        expect($hint.length).toEqual(1);
        expect($hint.text()).toEqual($.Suggestions.defaultHint);
    });

    it('Should display custom hint message above suggestions', function(){
        var customHint = 'This is custon hint';
        this.instance.setOptions({
            hint: customHint
        });

        this.input.value = 'jam';
        this.instance.onValueChange();
        this.server.respond(serviceUrl, helpers.responseFor(['Jamaica']));

        var $hint = this.instance.$container.find('.suggestions-hint');
            
        expect($hint.length).toEqual(1);
        expect($hint.text()).toEqual(customHint);
    });

    it('Should not display any hint message above suggestions', function(){
        this.instance.setOptions({
            hint: false
        });

        this.input.value = 'jam';
        this.instance.onValueChange();
        this.server.respond(serviceUrl, helpers.responseFor(['Jamaica']));

        var $hint = this.instance.$container.find('.suggestions-hint');
            
        expect($hint.length).toEqual(0);
    });

});