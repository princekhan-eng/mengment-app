import Manager from "@/models/menager.model";

export async function generateEmployeeId(): Promise<string> {
    while (true) {
        // Generate exactly 8 digits
        const employeeId = Math.floor(
            10000000 + Math.random() * 90000000
        ).toString();

        // Check if this ID already exists
        const existingManager = await Manager.exists({
            employeeId,
        });

        // If not found, this ID is unique
        if (!existingManager) {
            return employeeId;
        }
    }
}