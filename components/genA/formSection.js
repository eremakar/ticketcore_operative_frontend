import { useState } from "react"
import IconCaretDown from '@/components/icon/icon-caret-down';
import AnimateHeight from "react-animate-height";

export const FormSection = ({ title, defaultCollapsed = false, icon, children, type, ...props }) => {
    const [collapsed, setCollapsed] = useState(defaultCollapsed);

    switch (type) {
        case 'expandable':
            return <div className="rounded border border-[#d3d3d3] dark:border-[#1b2e4b] mb-5">
                <button type="button" className={`flex w-full items-center p-4 text-white-dark dark:bg-[#1b2e4b] ${!collapsed ? 'text-primary' : ''}`} onClick={() => setCollapsed(!collapsed)}>
                    {/* {icon} */}
                    {title}
                    <div className={`ltr:ml-auto rtl:mr-auto ${collapsed ? 'rotate-180' : ''}`}>
                        <IconCaretDown />
                    </div>
                </button>
                <div>
                    <AnimateHeight duration={300} height={!collapsed ? 'auto' : 0}>
                        <div className="space-y-2 p-4 text-white-dark text-[13px] border-t border-[#d3d3d3] dark:border-[#1b2e4b]">
                            {children}
                        </div>
                    </AnimateHeight>
                </div>
            </div>

            // <Accordion2 title={title} button={button} {...props}>{children}</Accordion2>
        default:
            return <div className="panel mb-5">{children}</div>
    }
}
