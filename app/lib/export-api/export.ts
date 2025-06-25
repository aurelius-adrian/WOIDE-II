import { getAnnotationContentControls } from "../annotation-api/annotations";


export async function Export() {
    Word.run(async (context) => {
        const as = await getAnnotationContentControls();
        for (const a of as) {
            a.load();
            await context.sync()
        }
    });
}