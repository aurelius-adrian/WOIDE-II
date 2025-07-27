export const RequiredLabel = ({ label, required }: { label: string; required: boolean | undefined }) => {
    return (
        <>
            {label}
            {required && (
                <span className="text-red-500" title="This field is required.">
                    *
                </span>
            )}
        </>
    );
};
