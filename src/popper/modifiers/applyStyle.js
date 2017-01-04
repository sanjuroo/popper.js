import getSupportedPropertyName from '../utils/getSupportedPropertyName';
import setStyles from '../utils/setStyles';
import setAttributes from '../utils/setAttributes';
import getReferenceOffsets from '../utils/getReferenceOffsets';
import computeAutoPlacement from '../utils/computeAutoPlacement';

/**
 * Apply the computed styles to the popper element
 * @method
 * @memberof Modifiers
 * @argument {Object} data - The data object generated by `update` method
 * @argument {Object} data.styles - List of style properties - values to apply to popper element
 * @argument {Object} data.attributes - List of attribute properties - values to apply to popper element
 * @argument {Object} options - Modifiers configuration and options
 * @returns {Object} The same data object
 */
export default function applyStyle(data, options) {
    // apply the final offsets to the popper
    // NOTE: 1 DOM access here
    const styles = {
        position: data.offsets.popper.position
    };

    const attributes = {
        'x-placement': data.placement,
    };

    // round top and left to avoid blurry text
    const left = Math.round(data.offsets.popper.left);
    const top = Math.round(data.offsets.popper.top);

    // if gpuAcceleration is set to true and transform is supported,
    //  we use `translate3d` to apply the position to the popper we
    // automatically use the supported prefixed version if needed
    const prefixedProperty = getSupportedPropertyName('transform');
    if (options.gpuAcceleration && prefixedProperty) {
        styles[prefixedProperty] = 'translate3d(' + left + 'px, ' + top + 'px, 0)';
        styles.top = 0;
        styles.left = 0;
        styles.willChange = 'transform';
    }
    // othwerise, we use the standard `left` and `top` properties
    else {
        styles.left =left;
        styles.top = top;
        styles.willChange = 'top, left';
    }

    // any property present in `data.styles` will be applied to the popper,
    // in this way we can make the 3rd party modifiers add custom styles to it
    // Be aware, modifiers could override the properties defined in the previous
    // lines of this modifier!
    setStyles(data.instance.popper, {...styles, ...data.styles});

    // any property present in `data.attributes` will be applied to the popper,
    // they will be set as HTML attributes of the element
    setAttributes(data.instance.popper, {...attributes, ...data.attributes});

    // if the arrow style has been computed, apply the arrow style
    if (data.offsets.arrow) {
        setStyles(data.arrowElement, data.offsets.arrow);
    }

    return data;
}

/**
 * Set the x-placement attribute before everything else because it could be used to add margins to the popper
 * margins needs to be calculated to get the correct popper offsets
 * @method
 * @memberof Popper.modifiers
 * @param {HTMLElement} reference - The reference element used to position the popper
 * @param {HTMLElement} popper - The HTML element used as popper.
 * @param {Object} options - Popper.js options
 */
export function applyStyleOnLoad(reference, popper, options, modifierOptions, state) {
    // compute reference element offsets
    const referenceOffsets = getReferenceOffsets(state, popper, reference);

    // compute auto placement, store placement inside the data object,
    // modifiers will be able to edit `placement` if needed
    // and refer to originalPlacement to know the original value
    options.placement = computeAutoPlacement(options.placement, referenceOffsets, popper);

    popper.setAttribute('x-placement', options.placement);
    return options;
}
