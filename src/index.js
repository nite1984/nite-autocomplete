/**
 * NiteAutocomplete
 * v1.0.3 2022/06/07
 * Author: Marco Scattina
 * https://github.com/nite1984/nite-autocomplete
 * 
 * Released under the MIT License
 */

/**/
const NiteAutocomplete = (function () {
    'use strict';

    /**/
    const Constructor = function (options) {

        //Default settings
        const defaults = {
            inputSelector: '',
            ajaxSourceUrl: (term) => {
                return term;
            },
            renderDropdownElement: (el) => {
                return el;
            },
            renderSelectedElement: (el) => {
                return el;
            },
            minLength: 3,
            disableOnSelect: true,
            disableResetIcon: false,
            selectCallback: null,
            deselectCallback: null,
            searchInputIconClass: 'bi-person-fill',
            noResultsText: 'No results',
            ajaxErrorCallback: (e) => {
                console.log(e);
            }
        };

        /**/
        const settings = Object.assign({}, defaults, options);
        const searchInput = document.querySelector(settings.inputSelector);

        if (!searchInput) {
            throw new Error('Invalid input element');
        }
        if (
            (settings.selectCallback !== null && typeof settings.selectCallback !== 'function') ||
            (settings.deselectCallback !== null && typeof settings.deselectCallback !== 'function') ||
            (typeof settings.ajaxErrorCallback !== 'function')
        ) {
            throw new Error('Invalid args');
        }

        const searchInputIcon = searchInput.parentNode.querySelector('.dropdown-icon');
        const dropdownMenu = document.createElement('div');

        if (!searchInputIcon) {
            dropdownMenu.classList.add('dropdown-menu', 'w-100');
            searchInput.insertAdjacentElement('afterend', dropdownMenu);
        } else {
            dropdownMenu.classList.add('dropdown-menu');
            searchInputIcon.parentNode.parentNode.insertAdjacentElement('afterend', dropdownMenu);
        }

        const keys = {
            up: 38,
            down: 40,
            enter: 13
        };
        let xhrLock = false;
        let searchResults = [];
        let selectedElement = null;
        const publicAPIs = {};

        //Inizio ricerca
        searchInput.addEventListener('keyup', function (e) {
            if (e.which === keys.up || e.which === keys.down || e.which === keys.enter) {
                return;
            }

            const term = searchInput.value.trim();

            dropdownMenu.innerHTML = '';
            dropdownMenu.classList.remove('show');

            if (term.length >= settings.minLength && !xhrLock) {
                xhrLock = true;

                fetchSearchResults(term).then((res) => {
                    searchResults = res;
                    renderSearchResults();
                    xhrLock = false;
                }).catch(e => {
                    settings.ajaxErrorCallback(e);
                    xhrLock = false;
                });
            }
        }, false);

        //Selezione risultato
        dropdownMenu.addEventListener('mousedown', function (e) {
            e.preventDefault();

            let dropdownItem = e.target.closest('.dropdown-item');
            if (dropdownItem) {
                updateSelection(searchResults[dropdownItem.dataset.index]);
            }
        }, false);

        //Annulla selezione (click su icona)
        if (searchInputIcon) {
            searchInputIcon.addEventListener('click', function (e) {
                e.preventDefault();

                if (settings.disableResetIcon == false && searchInput.value != '' /*&& searchInput.disabled == true*/ ) {
                    resetSelection();
                }
            });
        }

        //Focus out input ricerca
        searchInput.addEventListener('focusout', function (e) {
            if (!e.relatedTarget || !e.relatedTarget.matches('.dropdown-item')) {
                dropdownMenu.classList.remove('show');
            }
        });

        //Focus in input ricerca
        searchInput.addEventListener('focusin', function (e) {
            if (searchInput.value != '') {
                dropdownMenu.classList.add('show');
            }
        });

        //Scroll risultati con up\down e selezione con enter
        searchInput.addEventListener('keydown', function (e) {
            let selectedElement = dropdownMenu.querySelector('a.active');

            if (e.which === keys.up || e.which === keys.down) {
                const dropdownElements = dropdownMenu.querySelectorAll('a');

                if (selectedElement) {
                    selectedElement.classList.remove('active');
                }

                if (e.which === keys.down) {
                    if (!selectedElement || selectedElement === selectedElement.parentNode.lastChild) {
                        selectedElement = dropdownElements.item(0);
                    } else {
                        selectedElement = selectedElement.nextElementSibling;
                    }
                } else if (e.which === keys.up) {
                    if (!selectedElement || selectedElement === selectedElement.parentNode.firstChild) {
                        selectedElement = dropdownElements.item(dropdownElements.length - 1);
                    } else {
                        selectedElement = selectedElement.previousElementSibling;
                    }
                }
                selectedElement.classList.add('active');
            } else if (e.which === keys.enter) {
                e.preventDefault();
                if (selectedElement) {
                    updateSelection(searchResults[selectedElement.dataset.index]);
                }
            }
        });

        /**/
        async function fetchSearchResults(term) {
            const req = await fetch(
                settings.ajaxSourceUrl(term), {
                    method: 'GET',
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest'
                    }
                });

            if (!req.ok) {
                throw new Error(`HTTP error - status: ${req.status}`);
            } else {
                return await req.json();
            }
        }

        /**/
        function renderSearchResults() {
            if (searchResults.length > 0) {
                searchResults.forEach((el, i) => {
                    let a = document.createElement('a');
                    a.classList.add('dropdown-item', 'text-truncate');
                    a.href = '#';
                    a.innerHTML = settings.renderDropdownElement(el);
                    a.dataset.index = i;
                    dropdownMenu.appendChild(a);
                });
            } else {
                let a = document.createElement('a');
                a.classList.add('dropdown-item', 'text-truncate', 'disabled');
                a.href = '#';
                a.innerHTML = settings.noResultsText;
                dropdownMenu.appendChild(a);
            }

            dropdownMenu.classList.add('show');
        }

        /**/
        function updateSelection(el) {
            selectedElement = el;
            searchResults = [];
            searchInput.value = settings.renderSelectedElement(el);
            dropdownMenu.innerHTML = '';
            dropdownMenu.classList.remove('show');

            if (settings.disableOnSelect) {
                searchInput.disabled = true;
                if (searchInputIcon != null && settings.disableResetIcon == false) {
                    searchInputIcon.classList.remove(settings.searchInputIconClass);
                    searchInputIcon.classList.add('bi', 'bi-x-lg', 'text-danger', 'pointer');
                }
            }
            if (settings.selectCallback != null) {
                settings.selectCallback(el);
            }
        }

        /**/
        function resetSelection() {
            selectedElement = null;
            searchInput.value = '';
            searchInput.disabled = false;
            if (searchInputIcon != null) {
                searchInputIcon.classList.remove('bi', 'bi-x-lg', 'text-danger', 'pointer');
                searchInputIcon.classList.add(settings.searchInputIconClass);
            }
            if (settings.deselectCallback != null) {
                settings.deselectCallback();
            }
        }

        //Public Interface

        /**/
        publicAPIs.getSelectedElement = function () {
            return selectedElement;
        }

        /**/
        publicAPIs.setSelectedElement = function (element) {
            updateSelection(element);
        };

        /**/
        publicAPIs.reset = function () {
            resetSelection();
        }

        /**/
        publicAPIs.disableResetIcon = function () {
            settings.disableResetIcon = true;
            if (searchInputIcon) {
                searchInputIcon.classList.remove('bi', 'bi-x-lg', 'text-danger', 'pointer');
                searchInputIcon.classList.add('bi', settings.searchInputIconClass);
            }
        }

        /**/
        publicAPIs.enableResetIcon = function () {
            settings.disableResetIcon = false;
        }

        return publicAPIs;
    };

    return Constructor;
})();

module.exports = NiteAutocomplete;