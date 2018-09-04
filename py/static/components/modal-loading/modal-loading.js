angular.module('srirama')
    .component('modalLoading', {
        bindings: {
            modalLoadingShow: '='
        },
        template: require('./modal-loading.html')
    })