from collections.abc import Generator
from typing import Any
from ytelegraph import TelegraphAPI # Import the library we're using

from dify_plugin import Tool
from dify_plugin.entities.tool import ToolInvokeMessage

class TelegraphTool(Tool):
    """
    A simple Telegraph publishing tool.
    """

    def _invoke(self, tool_parameters: dict[str, Any]) -> Generator[ToolInvokeMessage, None, None]:
        """
        Create a new Telegraph page based on the input title and content.

        Args:
            tool_parameters: A dictionary containing the tool input parameters:
                - p_title (str): The title of the Telegraph page.
                - p_content (str): The content to publish in Markdown format.

        Yields:
            ToolInvokeMessage: A message containing the URL of the successfully created Telegraph page.

        Raises:
            Exception: If page creation fails, an exception with error information is thrown.
        """
        # 1. Get credentials from runtime
        try:
            access_token = self.runtime.credentials["telegraph_access_token"]
        except KeyError:
            raise Exception("Telegraph Access Token is not configured or invalid. Please provide it in the plugin settings.")

        # 2. Get tool input parameters
        title = tool_parameters.get("p_title", "Untitled") # Use .get to provide default value
        content = tool_parameters.get("p_content", "")

        if not content:
            raise Exception("Publication content cannot be empty.")

        # 3. Call the library to execute operations
        try:
            telegraph = TelegraphAPI(access_token)  # Initialize Telegraph API
            ph_link = telegraph.create_page_md(title, content)  # Create page
        except Exception as e:
            # If the library call fails, throw an exception
            raise Exception(f"Telegraph API call failed: {e}")

        # 4. Return results
        # Use create_link_message to generate an output message containing a link
        yield self.create_link_message(ph_link)