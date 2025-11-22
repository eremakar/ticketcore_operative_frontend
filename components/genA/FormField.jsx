import { Field } from "./field";

export default function FormField({name = '', label, children, gap="20", error, onChange, trigger, isValidated = false, isEqual=false, orientation, style, addon, validateOnInput = false, ...props}) {
    return orientation == 'vertical' ?
        <>
            <label for={name} style={{hyphens: 'auto', width: '100%', wordBreak: 'keep-all', wordWrap: 'break-word', alignSelf: 'end', paddingTop: '5px', ...style}}>{label}</label>
            <div className={error ? 'has-error' : ''} style={{width: '100%'}}>
                {children ? children : (
                    addon ? (
                        <div className="flex gap-1">
                            <Field onChange={onChange} {...props} className={`${props.className || ''} rounded-r-none`} />
                            <div className="rounded-l-none">{addon}</div>
                        </div>
                    ) : <Field onChange={onChange} {...props} />
                )}
            </div>
        </>
        :
        <div class="flex sm:flex-row flex-col" style={{alignItems: 'center'}}>
            <label for={name} className="mb-0 sm:w-1/4 sm:ltr:mr-2 rtl:ml-2">{label}</label>
            {isValidated ? <div className={error ? 'has-error' : 'has-success'} style={{width: '100%'}}>
                {children ? children : (
                    addon ? (
                        <div className="flex gap-1">
                            <Field onChange={(value, originalObj, mappedObj) => {
                                onChange && onChange(value, originalObj, mappedObj);
                                trigger && validateOnInput && trigger();
                            }} {...props} className={`${props.className || ''} rounded-r-none`} />
                            <div className="rounded-l-none">{addon}</div>
                        </div>
                    ) : <Field onChange={(value, originalObj, mappedObj) => {
                        onChange && onChange(value, originalObj, mappedObj);
                        trigger && validateOnInput && trigger();
                    }} {...props} />
                )}
                {error && <div className="mt-1 text-danger">{error}</div>}
            </div> : (
                children ? children : (
                    addon ? (
                        <div className="flex gap-1">
                            <Field onChange={onChange} {...props} className={`${props.className || ''} rounded-r-none`} />
                            <div className="rounded-l-none">{addon}</div>
                        </div>
                    ) : <Field onChange={onChange} {...props} />
                )
            )}
        </div>
}
