import os
import xml.etree.ElementTree as ET
from django.conf import settings

class XMLConfigManager:
    """
    Manager for System Studio to modify standard IARC/CanReg5 XML definitions
    """
    def __init__(self, filename="system_def.xml"):
        self.base_dir = os.path.join(settings.BASE_DIR, 'registry', 'config')
        if not os.path.exists(self.base_dir):
            os.makedirs(self.base_dir)
        self.filepath = os.path.join(self.base_dir, filename)
        
        if not os.path.exists(self.filepath):
            self._create_default_config()

    def _create_default_config(self):
        root = ET.Element("CanReg5Config")
        system = ET.SubElement(root, "SystemInfo")
        ET.SubElement(system, "RegistryName").text = "Registre Cancer Algérie"
        ET.SubElement(system, "Country").text = "Algeria"
        
        variables = ET.SubElement(root, "Variables")
        # Example local variable
        ET.SubElement(variables, "Variable", name="NID_REQUIRED").text = "True"
        
        tree = ET.ElementTree(root)
        tree.write(self.filepath, encoding='utf-8', xml_declaration=True)

    def read_config(self):
        tree = ET.parse(self.filepath)
        return ET.tostring(tree.getroot(), encoding='unicode')

    def update_variable(self, var_name, value):
        tree = ET.parse(self.filepath)
        root = tree.getroot()
        for var in root.findall(".//Variable"):
            if var.get("name") == var_name:
                var.text = value
                tree.write(self.filepath)
                return True
        return False

    def add_variable(self, var_name, value):
        tree = ET.parse(self.filepath)
        root = tree.getroot()
        vars_node = root.find("Variables")
        new_var = ET.SubElement(vars_node, "Variable", name=var_name)
        new_var.text = value
        tree.write(self.filepath)
        return True
