angular.module('srirama')
    .component('menuContainer', {
        bindings: {
            selectDimension: '&',
            footerShow: '&',
            selectLocation: '&',
            modalCariNilaiMinMaxShow: '=',
            modalPotongDataShow: '='
        },
        template: require('./menu-container.html')
    })