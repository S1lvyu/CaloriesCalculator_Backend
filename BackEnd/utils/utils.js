const calculateCalories = (height, age, currentWeight, desiredWeight) => {
  const goal =
    desiredWeight > currentWeight
      ? "gain"
      : desiredWeight === currentWeight
      ? "maintain"
      : "lose";

  let basalMetabolicRate = 0;

  switch (goal) {
    case "lose":
      basalMetabolicRate = 10 * currentWeight + 6.25 * height - 5 * age - 500;
      break;
    case "maintain":
      basalMetabolicRate = 10 * currentWeight + 6.25 * height - 5 * age;
      break;
    case "gain":
      basalMetabolicRate = 10 * currentWeight + 6.25 * height - 5 * age + 500;
      break;
    default:
      throw new Error("Invalid goal");
  }

  return basalMetabolicRate;
};
module.exports = { calculateCalories };
