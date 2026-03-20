export function getPolicyKey(policies: readonly string[], policy: string, index: number): string {
	const duplicateIndex = policies.slice(0, index).filter((value) => value === policy).length;
	return `${policy}-${duplicateIndex}`;
}
