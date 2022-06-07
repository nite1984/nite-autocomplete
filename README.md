# nite-autocomplete

## Install

```
npm i @nite1984/nite-autocomplete
```

```
import NiteAutocomplete from '@nite1984/nite-autocomplete';

window.NiteAutocomplete = NiteAutocomplete;
```

## Example Usage

```
const autocomplete = new NiteAutocomplete({
    inputSelector: '#input-autocomplete',
    ajaxSourceUrl: (term) => {
        return 'my/autocomplete/route?term=' + term;
    },
    renderDropdownElement: (el) => {
        return el.name + ' ' + el.surname;
    },
    renderSelectedElement: (el) => {
        return el.name + ' ' + el.surname;
    },
    selectCallback: (el) => {
        window.location.href = '/profile/' + el.id;
    }
});
```

```
###### Returns the current selected item (null if selection is empty)
autocomplete.getSelectedElement();

###### Manually set the current selected element
###### /Note that the object can have any field, this is just an example)
autocomplete.setSelectedElement({
    id: 1,
    name: 'John',
    surname: 'Doe'
});

###### Reset selection
autocomplete.reset();

###### Disables the reset functionality
autocomplete.disableResetIcon();

###### Re-enables the reset functionality
autocomplete.enableResetIcon();
```

## Available Options

```
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
```
